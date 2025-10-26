import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

// Configuración de DigitalOcean Spaces
const spacesClient = new S3Client({
  endpoint: process.env.DO_SPACES_ENDPOINT,
  region: process.env.DO_SPACES_REGION,
  credentials: {
    accessKeyId: process.env.DO_SPACES_KEY || '',
    secretAccessKey: process.env.DO_SPACES_SECRET || '',
  },
})

const BUCKET_NAME = process.env.DO_SPACES_BUCKET
if (!BUCKET_NAME) {
  throw new Error('DO_SPACES_BUCKET is not set')
}

export class DigitalOceanSpacesService {
  // Subir archivo a DigitalOcean Spaces
  static async uploadFile(file: Buffer, fileName: string, contentType: string): Promise<string> {
    try {
      const key = `laboratorio/${Date.now()}-${fileName}`
      
      console.log('=== DigitalOcean Spaces Debug ===')
      console.log('BUCKET_NAME:', BUCKET_NAME)
      console.log('DO_SPACES_REGION:', process.env.DO_SPACES_REGION)
      console.log('DO_SPACES_ENDPOINT:', process.env.DO_SPACES_ENDPOINT)
      console.log('Key:', key)
      
      const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: file,
        ContentType: contentType,
        ACL: 'public-read', // Hacer el archivo público
      })

      await spacesClient.send(command)
      
      // Retornar la URL pública del archivo
      const url = `https://${BUCKET_NAME}.${process.env.DO_SPACES_REGION || 'nyc3'}.digitaloceanspaces.com/${key}`
      console.log('Generated URL:', url)
      return url
    } catch (error) {
      console.error('Error subiendo archivo a DigitalOcean Spaces:', error)
      throw new Error('Error al subir el archivo')
    }
  }

  // Generar URL firmada para descarga privada (opcional)
  static async getSignedDownloadUrl(key: string, expiresIn: number = 3600): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
      })

      return await getSignedUrl(spacesClient, command, { expiresIn })
    } catch (error) {
      console.error('Error generando URL firmada:', error)
      throw new Error('Error al generar URL de descarga')
    }
  }

  // Eliminar archivo de DigitalOcean Spaces
  static async deleteFile(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
      })

      await spacesClient.send(command)
    } catch (error) {
      console.error('Error eliminando archivo de DigitalOcean Spaces:', error)
      throw new Error('Error al eliminar el archivo')
    }
  }

  // Extraer key de la URL pública
  static extractKeyFromUrl(url: string): string {
    const parts = url.split('/')
    return parts.slice(3).join('/') // Remover protocolo, bucket y región
  }
}
