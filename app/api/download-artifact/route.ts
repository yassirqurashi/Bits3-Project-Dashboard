import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getSupabaseUrl } from '../../../lib/supabase/config'

const getStoragePath = (fileUrl: string) => {
  const marker = '/object/public/artifacts/'
  const markerIndex = fileUrl.indexOf(marker)

  if (markerIndex < 0) return ''

  const pathWithQuery = fileUrl.slice(markerIndex + marker.length)
  return decodeURIComponent(pathWithQuery.split('?')[0])
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const artifactId = searchParams.get('id')

    if (!artifactId) {
      return NextResponse.json({ error: 'Artifact is required' }, { status: 400 })
    }

    const supabaseAdmin = createClient(
      getSupabaseUrl(),
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: artifact, error: artifactError } = await supabaseAdmin
      .from('artifacts')
      .select('file_url, file_name, name')
      .eq('id', artifactId)
      .single()

    if (artifactError || !artifact) {
      return NextResponse.json({ error: 'Artifact not found' }, { status: 404 })
    }

    const storagePath = getStoragePath(artifact.file_url)

    if (!storagePath) {
      return NextResponse.json({ error: 'Artifact file path is invalid' }, { status: 400 })
    }

    const { data: file, error: downloadError } = await supabaseAdmin.storage
      .from('artifacts')
      .download(storagePath)

    if (downloadError || !file) {
      return NextResponse.json(
        { error: downloadError?.message || 'Artifact file could not be downloaded' },
        { status: 404 }
      )
    }

    const fileName = artifact.file_name || artifact.name || 'artifact'
    const encodedFileName = encodeURIComponent(fileName)

    return new NextResponse(await file.arrayBuffer(), {
      headers: {
        'Content-Type': file.type || 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${fileName.replace(/"/g, '')}"; filename*=UTF-8''${encodedFileName}`,
        'Cache-Control': 'no-store',
      },
    })
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Something went wrong' },
      { status: 500 }
    )
  }
}
