import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const userCount = await prisma.supervisor.count();
    const dbUrl = process.env.DATABASE_URL;
    
    // Safety: Only show first few chars of DB URL
    const sanitizedUrl = dbUrl ? `${dbUrl.substring(0, 15)}...` : 'NOT_SET';

    return NextResponse.json({
      status: 'ok',
      message: 'Database connection successful',
      userCount,
      databaseUrlPrefix: sanitizedUrl,
      nextAuthUrl: process.env.NEXTAUTH_URL,
      env: process.env.NODE_ENV
    });
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      message: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
