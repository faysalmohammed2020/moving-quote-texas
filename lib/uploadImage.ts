// lib/uploadImage.ts
export async function uploadImage(file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file);

  const res = await fetch("/api/upload", {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    const msg = await res.json().catch(() => ({}));
    throw new Error(msg?.error || "Upload failed");
  }

  const data = await res.json();
  return data.url as string; // e.g. "/image/12345-abc.jpg"
}
