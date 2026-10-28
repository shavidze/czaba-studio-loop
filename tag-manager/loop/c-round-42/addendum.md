# C — Round 42 addendum (c-round-42.md-ის შევსება; c-round-42.md-ის Edit-ზე permission ვერ მივიღე)

- **bugs:** c-round-42.json-ში არის **C-R42-01** (low, docs reference, B-სთვის): Mp3tag R1-ის „one slot per name“ წინადადება cited წყაროებში ვერ ვიპოვე. ის A-ს implementation-ის დეფექტი არ არის, taskStatus PASS რჩება. c-round-42.md-ის header-ში „bugs `[]`“ ამით ჩანაცვლდება.
- **R42-7, დამატებით:**
  - A-ს remapped ძველი line ref-ები 001-ში `sed`-ით შევამოწმე, ყველა სწორია:
    - `:67` isMountedRef, `:69-74` mount effect, `:75` isApplying, `:77` enabledStandardKeys;
    - `:93-114` handleToggleStandard;
    - `:181-193` handleSave (`:182` guard, `:183` setIsApplying(true), `:186-189` catch, `:190` mounted check, `:191` setIsApplying(false), `:193` deps);
    - `:209` fieldset, `:322` `</fieldset>`;
    - `:230`/`:238` reorderArrowClassName, `:246` Trash, `:254` X, `:275` chip;
    - `:265-288` section, `:331-332` aria-disabled/aria-busy.
  - renderer baseline 310 დამოუკიდებლად დადასტურდა `c-round-41/gate.log`-ით (`Tests 310 passed`). 317 = 310 + 7.
- **Source integrity:** probe-ების შემდეგ `git status --porcelain --untracked-files=all` = ზუსტად 6 `M` ფაილი, untracked არ არის. C-ის ფაზაში source არ შეცვლილა.
