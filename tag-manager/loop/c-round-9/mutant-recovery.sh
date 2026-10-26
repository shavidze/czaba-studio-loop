#!/usr/bin/env bash
set -euo pipefail

readonly APT_ATTEMPT_TIMEOUT_SECONDS="${APT_ATTEMPT_TIMEOUT_SECONDS:-240}"
readonly APT_ATTEMPTS="${APT_ATTEMPTS:-2}"
readonly APT_KILL_AFTER_SECONDS="${APT_KILL_AFTER_SECONDS:-10}"
readonly APT_RECOVERY_TIMEOUT_SECONDS="${APT_RECOVERY_TIMEOUT_SECONDS:-60}"
readonly TIMEOUT_EXIT_TERM=124
readonly TIMEOUT_EXIT_KILL=137

print_usage_error() {
  echo "Usage: bash .github/scripts/apt-install.sh <package>..." >&2
  echo "Environment: APT_ATTEMPT_TIMEOUT_SECONDS (default 240), APT_ATTEMPTS (default 2), APT_KILL_AFTER_SECONDS (default 10), APT_RECOVERY_TIMEOUT_SECONDS (default 60)" >&2
}

is_positive_integer() {
  [[ "$1" =~ ^[1-9][0-9]*$ ]]
}

worst_case_seconds() {
  local bounded_recovery=$((APT_RECOVERY_TIMEOUT_SECONDS + APT_KILL_AFTER_SECONDS))
  local bounded_attempt=$((APT_ATTEMPT_TIMEOUT_SECONDS + APT_KILL_AFTER_SECONDS))
  echo $((bounded_recovery + APT_ATTEMPTS * bounded_attempt + (APT_ATTEMPTS - 1) * bounded_recovery))
}

disable_man_db_triggers() {
  echo 'set man-db/auto-update false' \
    | run_bounded_as_root "${APT_RECOVERY_TIMEOUT_SECONDS}" debconf-communicate >/dev/null 2>&1 || true
  sudo rm -f /var/lib/man-db/auto-update
}

run_bounded_as_root() {
  local bound_seconds="$1"
  shift
  sudo env DEBIAN_FRONTEND=noninteractive \
    timeout --kill-after="${APT_KILL_AFTER_SECONDS}" "${bound_seconds}" "$@"
}

remaining_attempt_seconds() {
  local attempt_deadline="$1"
  local remaining=$((attempt_deadline - SECONDS))
  if ((remaining < 1)); then
    remaining=1
  fi
  echo "${remaining}"
}

run_apt_attempt() {
  local attempt_deadline=$((SECONDS + APT_ATTEMPT_TIMEOUT_SECONDS))
  local phase_exit=0

  run_bounded_as_root "$(remaining_attempt_seconds "${attempt_deadline}")" \
    apt-get -o Dpkg::Use-Pty=0 update || phase_exit=$?
  if ((phase_exit != 0)); then
    failed_apt_phase="apt-get update"
    return "${phase_exit}"
  fi

  if ((SECONDS >= attempt_deadline)); then
    failed_apt_phase="apt-get update"
    return "${TIMEOUT_EXIT_TERM}"
  fi

  run_bounded_as_root "$(remaining_attempt_seconds "${attempt_deadline}")" \
    apt-get -o Dpkg::Use-Pty=0 install -y --no-install-recommends "${requested_packages[@]}" || phase_exit=$?
  if ((phase_exit != 0)); then
    failed_apt_phase="apt-get install"
    return "${phase_exit}"
  fi
}

recover_interrupted_dpkg() {
  run_bounded_as_root "${APT_ATTEMPT_TIMEOUT_SECONDS}" dpkg --configure -a || true
}

describe_attempt_outcome() {
  local attempt_exit="$1"
  if ((attempt_exit == 0)); then
    echo "ok"
  elif ((attempt_exit == TIMEOUT_EXIT_TERM || attempt_exit == TIMEOUT_EXIT_KILL)); then
    echo "timed out in ${failed_apt_phase}"
  else
    echo "failed (exit ${attempt_exit}) in ${failed_apt_phase}"
  fi
}

if (($# == 0)); then
  print_usage_error
  exit 2
fi

for knob_value in "${APT_ATTEMPT_TIMEOUT_SECONDS}" "${APT_ATTEMPTS}" \
  "${APT_KILL_AFTER_SECONDS}" "${APT_RECOVERY_TIMEOUT_SECONDS}"; do
  if ! is_positive_integer "${knob_value}"; then
    print_usage_error
    exit 2
  fi
done

requested_packages=("$@")
failed_apt_phase=""

echo "apt-install: worst case $(worst_case_seconds)s"

disable_man_db_triggers

for ((attempt_number = 1; attempt_number <= APT_ATTEMPTS; attempt_number++)); do
  if ((attempt_number > 1)); then
    recover_interrupted_dpkg
  fi
  attempt_started_at=${SECONDS}
  attempt_exit=0
  failed_apt_phase=""
  run_apt_attempt || attempt_exit=$?
  attempt_elapsed_seconds=$((SECONDS - attempt_started_at))
  echo "apt-install: attempt ${attempt_number}/${APT_ATTEMPTS} $(describe_attempt_outcome "${attempt_exit}") after ${attempt_elapsed_seconds}s"
  if ((attempt_exit == 0)); then
    exit 0
  fi
done

echo "apt-install: failed after ${APT_ATTEMPTS} attempts"
exit 1
