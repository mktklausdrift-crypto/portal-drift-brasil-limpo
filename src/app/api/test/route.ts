// Test endpoint - completely public, no auth
export async function GET() {
  return Response.json({
    message: "Test endpoint working - completely public",
    timestamp: new Date().toISOString(),
    status: "success"
  });
}