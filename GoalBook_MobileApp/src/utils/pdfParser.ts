import * as DocumentPicker from 'expo-document-picker';
import { fileSystemService } from '../services/storage/fileSystem';
import { Book } from '../types/models';

export async function pickPdfDocument(): Promise<Book | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: 'application/pdf',
    copyToCacheDirectory: true,
  });

  if (result.canceled || !result.assets || result.assets.length === 0) {
    return null;
  }

  const asset = result.assets[0];
  const safeFilename = `${Date.now()}_${asset.name.replace(/\s+/g, '_')}`;
  const localUri = await fileSystemService.saveLocalBookFile(asset.uri, safeFilename);

  const newBook: Book = {
    id: `book_${Date.now()}`,
    title: asset.name.replace(/\.pdf$/i, ''),
    author: 'Unknown Author',
    fileUri: localUri,
    fileSize: asset.size || 0,
    pageCount: 1,
    currentPage: 1,
    progressPercent: 0,
    totalReadingTimeMinutes: 0,
    createdAt: new Date().toISOString(),
    lastReadAt: new Date().toISOString(),
  };

  return newBook;
}
