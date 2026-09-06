import ImageKit from "imagekit";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

function getImageKitClient() {
  return new ImageKit({
    publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || "public_ZUTFW1pg0uZzTrnYSom2foSwpX4=",
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY || "",
    urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || "https://ik.imagekit.io/claver"
  });
}

// GET /api/books — list books in cloud storage
export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ files: [] });
  }

  const imagekit = getImageKitClient();

  try {
    const files = await imagekit.listFiles({
      path: `/vocal_reader/${userId}/`,
    });
    return NextResponse.json({ files });
  } catch (e) {
    console.error("Error fetching ImageKit files:", e);
    return NextResponse.json({ files: [] });
  }
}

// DELETE /api/books?fileId=...&fileName=... — delete book from cloud storage
export async function DELETE(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const fileId = searchParams.get("fileId");
  const fileName = searchParams.get("fileName");

  if (!fileId && !fileName) {
    return NextResponse.json({ error: "fileId or fileName is required" }, { status: 400 });
  }

  const imagekit = getImageKitClient();

  try {
    let deleted = false;

    // If fileId is provided and does not look like a raw filename
    if (fileId && !fileId.toLowerCase().endsWith('.pdf')) {
      try {
        await imagekit.deleteFile(fileId);
        deleted = true;
      } catch (err) {
        console.warn("Direct fileId delete failed, attempting fallback by filename:", err);
      }
    }

    // Fallback search by fileName or fileId in user's ImageKit folder
    if (!deleted) {
      const targetName = fileName || fileId;
      if (targetName) {
        const files = await imagekit.listFiles({
          path: `/vocal_reader/${userId}/`,
          searchQuery: `name = "${targetName}"`,
        });
        if (files && Array.isArray(files) && files.length > 0) {
          for (const file of files as any[]) {
            if (file.fileId) {
              await imagekit.deleteFile(file.fileId);
              deleted = true;
            }
          }
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting ImageKit file:", error);
    return NextResponse.json({ error: "Failed to delete file" }, { status: 500 });
  }
}
