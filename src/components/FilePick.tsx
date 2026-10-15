import { useState } from "react";

type Props = {
  accept: string;
  label: string;
  multiple?: boolean;
  onFiles: (files: File[]) => void;
};

/** Does a file match an <input accept> list like "application/pdf,.xlsx"? */
function matches(file: File, accept: string) {
  return accept.split(",").some((raw) => {
    const t = raw.trim().toLowerCase();
    if (!t) return false;
    return t.startsWith(".") ? file.name.toLowerCase().endsWith(t) : file.type.toLowerCase() === t;
  });
}

export function FilePick({ accept, label, multiple, onFiles }: Props) {
  const [over, setOver] = useState(false);
  const deliver = (list: File[]) => {
    const ok = list.filter((f) => matches(f, accept));
    if (ok.length) onFiles(multiple ? ok : ok.slice(0, 1));
  };
  return (
    <label
      className={`drop${over ? " over" : ""}`}
      onDragOver={(e) => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => { e.preventDefault(); setOver(false); deliver([...e.dataTransfer.files]); }}
    >
      <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 16V4m0 0 4 4m-4-4L8 8M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" /></svg>
      <span>{label}</span>
      <input
        type="file"
        accept={accept}
        multiple={multiple}
        className="sr-only"
        onChange={(e) => { deliver([...(e.target.files ?? [])]); e.target.value = ""; }}
      />
    </label>
  );
}
