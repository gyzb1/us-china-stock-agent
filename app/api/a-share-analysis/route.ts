import { NextRequest, NextResponse } from 'next/server';
import { analyzeAShareCompany } from '@/lib/a-share-analysis-service';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const name = searchParams.get('name');
    const relation = searchParams.get('relation');

    if (!code || !name) {
      return NextResponse.json(
        { error: 'Missing required parameters: code and name' },
        { status: 400 }
      );
    }

    console.log(`Analyzing A-share company: ${code} ${name}`);

    const analysis = await analyzeAShareCompany(code, name, relation || undefined);

    if (!analysis) {
      return NextResponse.json(
        { error: 'Failed to generate analysis' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: analysis
    });

  } catch (error) {
    console.error('Error in A-share analysis API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
