import { NextRequest, NextResponse } from "next/server";
import { blobStorage } from "@/utils/blobStorage";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const action = url.searchParams.get("action");

    switch (action) {
      case "list":
        const data = await blobStorage.listAllData();
        return NextResponse.json({
          success: true,
          data,
          message: "Data list retrieved successfully",
        });

      case "clear":
        await blobStorage.clearAllData();
        return NextResponse.json({
          success: true,
          message: "All data cleared successfully",
        });

      default:
        // Default: return data list
        const defaultData = await blobStorage.listAllData();
        return NextResponse.json({
          success: true,
          data: defaultData,
          availableActions: ["list", "clear"],
          message: "Data management API. Use ?action=list|clear",
        });
    }
  } catch (error) {
    console.error("Data management error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to manage data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();

    switch (action) {
      case "clear":
        await blobStorage.clearAllData();
        return NextResponse.json({
          success: true,
          message: "All data cleared successfully",
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use "clear"' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Data management error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to manage data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
