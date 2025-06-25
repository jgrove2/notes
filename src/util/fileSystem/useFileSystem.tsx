import { create } from "zustand";

interface FileItem {
    name: string;
    handle: FileSystemFileHandle;
    content?: string;
}

interface useFileSystemState {
    files: Record<string, FileItem>;
    currentFile: string;
    directoryHandle: FileSystemDirectoryHandle | null;
    isLoading: boolean;
    error: string | null;
    setFiles: (files: Record<string, FileItem>) => void;
    setCurrentFile: (filePath: string) => void;
    selectDirectory: () => Promise<void>;
    loadFileContent: (fileName: string) => Promise<void>;
    saveFile: (fileName: string, content: string) => Promise<void>;
    createNewFile: (fileName: string, content?: string) => Promise<void>;
}


export const useFileSystemState = create<useFileSystemState>((set, get) => ({
    files: {},
    currentFile: '',
    directoryHandle: null,
    isLoading: false,
    error: null,
    setFiles: (files) => set({ files }),
    setCurrentFile: (filePath) => set({ currentFile: filePath }),
    
    selectDirectory: async () => {
        try {
            set({ isLoading: true, error: null });
            
            // Check if File System Access API is supported
            if (!('showDirectoryPicker' in window)) {
                throw new Error('File System Access API is not supported in this browser');
            }
            
            // Show directory picker
            const directoryHandle = await window.showDirectoryPicker({
                mode: 'readwrite',
                startIn: 'documents'
            });
            
            const files: Record<string, FileItem> = {};
            
            // Read all files in the directory
            for await (const [name, handle] of directoryHandle.entries()) {
                if (handle.kind === 'file') {
                    const fileHandle = handle as unknown as FileSystemFileHandle;
                    // Only include markdown and text files
                    if (name.endsWith('.md') || name.endsWith('.txt') || name.endsWith('.markdown')) {
                        files[name] = {
                            name,
                            handle: fileHandle
                        };
                    }
                }
            }
            
            set({ 
                directoryHandle, 
                files, 
                isLoading: false,
                error: null
            });
            
        } catch (error) {
            console.error('Error selecting directory:', error);
            set({ 
                isLoading: false, 
                error: error instanceof Error ? error.message : 'Failed to select directory'
            });
        }
    },
    
    loadFileContent: async (fileName: string) => {
        try {
            set({ isLoading: true, error: null });
            
            const { files } = get();
            const fileItem = files[fileName];
            
            if (!fileItem) {
                throw new Error(`File ${fileName} not found`);
            }
            
            const file = await fileItem.handle.getFile();
            const content = await file.text();
            
            // Update the file with content
            set(state => ({
                files: {
                    ...state.files,
                    [fileName]: {
                        ...fileItem,
                        content
                    }
                },
                currentFile: fileName,
                isLoading: false
            }));
            
        } catch (error) {
            console.error('Error loading file:', error);
            set({ 
                isLoading: false, 
                error: error instanceof Error ? error.message : 'Failed to load file'
            });
        }
    },
    
    saveFile: async (fileName: string, content: string) => {
        try {
            set({ isLoading: true, error: null });
            
            const { files } = get();
            const fileItem = files[fileName];
            
            if (!fileItem) {
                throw new Error(`File ${fileName} not found`);
            }
            
            const writable = await fileItem.handle.createWritable();
            await writable.write(content);
            await writable.close();
            
            // Update the file content in state
            set(state => ({
                files: {
                    ...state.files,
                    [fileName]: {
                        ...fileItem,
                        content
                    }
                },
                isLoading: false
            }));
            
        } catch (error) {
            console.error('Error saving file:', error);
            set({ 
                isLoading: false, 
                error: error instanceof Error ? error.message : 'Failed to save file'
            });
        }
    },
    
    createNewFile: async (fileName: string, content = '') => {
        try {
            set({ isLoading: true, error: null });
            
            const { directoryHandle } = get();
            
            if (!directoryHandle) {
                throw new Error('No directory selected');
            }
            
            // Create new file in the directory
            const fileHandle = await directoryHandle.getFileHandle(fileName, { create: true });
            
            // Write initial content
            const writable = await fileHandle.createWritable();
            await writable.write(content);
            await writable.close();
            
            // Add to files state
            set(state => ({
                files: {
                    ...state.files,
                    [fileName]: {
                        name: fileName,
                        handle: fileHandle,
                        content
                    }
                },
                currentFile: fileName,
                isLoading: false
            }));
            
        } catch (error) {
            console.error('Error creating file:', error);
            set({ 
                isLoading: false, 
                error: error instanceof Error ? error.message : 'Failed to create file'
            });
        }
    }
}));