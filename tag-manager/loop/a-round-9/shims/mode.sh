run_mode() {
  case "$1" in
    ok) exit 0;;
    hang) exec sleep 999;;
    hang-ignore-term) trap '' TERM; exec sleep 997;;
    fail) exit 100;;
  esac
}
