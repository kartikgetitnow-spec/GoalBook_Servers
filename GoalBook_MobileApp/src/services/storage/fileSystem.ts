import * as FileSystem from 'expo-file-system/legacy';
import { Platform } from 'react-native';

class FileSystemService {
  private baseDir: string = FileSystem.documentDirectory ? `${FileSystem.documentDirectory}books/` : '';

  async init(): Promise<void> {
    if (Platform.OS === 'web' || !this.baseDir) return;
    const dirInfo = await FileSystem.getInfoAsync(this.baseDir);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(this.baseDir, { intermediates: true });
    }
  }

  async saveLocalBookFile(originalUri: string, filename: string): Promise<string> {
    if (Platform.OS === 'web' || !this.baseDir) {
      return originalUri;
    }
    await this.init();
    const destination = `${this.baseDir}${filename}`;
    await FileSystem.copyAsync({
      from: originalUri,
      to: destination,
    });
    return destination;
  }

  async getFileInfo(uri: string): Promise<FileSystem.FileInfo> {
    return await FileSystem.getInfoAsync(uri);
  }

  async deleteFile(uri: string): Promise<void> {
    if (Platform.OS === 'web') return;
    const info = await FileSystem.getInfoAsync(uri);
    if (info.exists) {
      await FileSystem.deleteAsync(uri, { idempotent: true });
    }
  }
}

export const fileSystemService = new FileSystemService();
