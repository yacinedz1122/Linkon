import React, { useState } from "react";
import useSWR from "swr";
import { useSession, signIn, signOut } from "next-auth/react";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function Home() {
  const { data: session } = useSession();
  const { data: posts, mutate } = useSWR("/api/posts", fetcher);
  const [fileDataUrl, setFileDataUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [searchQ, setSearchQ] = useState("");
  const [searchRes, setSearchRes] = useState<any>(null);

  const onFileChange = (e: any) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => setFileDataUrl(reader.result as string);
    reader.readAsDataURL(f);
  };

  const upload = async () => {
    if (!fileDataUrl) return alert("اختر صورة أو فيديو");
    const u = await fetch("/api/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dataUrl: fileDataUrl })
    }).then((r) => r.json());
    await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageUrl: u.url, caption, mediaType: u.resource_type === "video" ? "VIDEO" : "IMAGE" })
    });
    setFileDataUrl("");
    setCaption("");
    mutate();
  };

  const doSearch = async () => {
    if (!searchQ) return;
    const res = await fetch(`/api/search?q=${encodeURIComponent(searchQ)}`).then((r) => r.json());
    setSearchRes(res);
  };

  const reportPost = async (postId: string) => {
    const reason = prompt("سبب التبليغ:");
    if (!reason) return;
    await fetch("/api/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId, reason })
    });
    alert("تم إرسال البلاغ");
  };

  const adminAction = async (action: string, userId: string) => {
    await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, userId })
    });
    alert("تم");
    mutate();
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <header className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Mini Instagram</h1>
        <div>
          {session ? (
            <>
              <span className="mr-2">{(session.user as any).email} {(session.user as any).role === "ADMIN" && "(Admin)"}</span>
              <button onClick={() => signOut()}>Logout</button>
            </>
          ) : (
            <button onClick={() => signIn()}>Sign in</button>
          )}
        </div>
      </header>

      <section className="mb-6">
        <input value={searchQ} onChange={(e) => setSearchQ(e.target.value)} placeholder="ابحث عن اسم/ايميل أو كلمات بالفيديو" className="border p-2 mr-2" />
        <button onClick={doSearch} className="bg-gray-800 text-white px-3 py-1">بحث</button>
        {searchRes && (
          <div className="mt-3">
            <h3 className="font-semibold">المستخدمون</h3>
            {searchRes.users.map((u: any) => <div key={u.id}>{u.name || u.email} {u.isBanned ? "(Banned)" : u.isMuted ? "(Muted)" : ""}</div>)}
            <h3 className="font-semibold mt-2">المنشورات</h3>
            {searchRes.posts.map((p: any) => (
              <div key={p.id} className="border p-2 my-2">
                <div className="text-sm text-gray-600">{p.author?.email}</div>
                <img src={p.imageUrl} className="w-full max-h-96 object-cover my-2" />
                <p>{p.caption}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {session && (
        <div className="mb-6">
          <input type="file" accept="image/*,video/*" onChange={onFileChange} />
          {fileDataUrl && (fileDataUrl.startsWith("data:video") ? <video src={fileDataUrl} controls className="max-h-48 my-2" /> : <img src={fileDataUrl} alt="preview" className="max-h-48 my-2" />)}
          <input value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Caption..." className="border p-2 w-full" />
          <button onClick={upload} className="mt-2 bg-blue-600 text-white px-4 py-2">Upload</button>
        </div>
      )}

      <main>
        {!posts && <div>Loading...</div>}
        {posts?.map((p: any) => (
          <article key={p.id} className="mb-6 border rounded p-2">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">{p.author?.email}</div>
              <div>
                {((session?.user as any)?.role === "ADMIN") && (
                  <>
                    <button className="mr-2 text-sm" onClick={() => adminAction("mute", p.author.id)}>Mute</button>
                    <button className="mr-2 text-sm" onClick={() => adminAction("unmute", p.author.id)}>Unmute</button>
                    <button className="mr-2 text-sm" onClick={() => adminAction("ban", p.author.id)}>Ban</button>
                    <button className="mr-2 text-sm" onClick={() => adminAction("unban", p.author.id)}>Unban</button>
                  </>
                )}
              </div>
            </div>

            {p.mediaType === "VIDEO" ? (
              <video src={p.imageUrl} controls className="w-full max-h-96 my-2" />
            ) : (
              <img src={p.imageUrl} alt={p.caption || "post"} className="w-full max-h-96 object-cover my-2" />
            )}

            <p>{p.caption}</p>
            <div className="text-xs text-gray-500">Likes: {p.likes?.length} — Comments: {p.comments?.length}</div>
            <div className="mt-2">
              <button onClick={() => reportPost(p.id)} className="text-red-600 text-sm">تبليغ</button>
            </div>
          </article>
        ))}
      </main>
    </div>
  );
}
