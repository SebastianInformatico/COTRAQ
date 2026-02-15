import { create } from 'zustand';
import apiService from '@/services/api';
import { Document } from '@/types';

interface DocumentState {
  documents: Document[];
  selectedDocument: Document | null;
  isLoading: boolean;
  error: string | null;

  fetchDocuments: (params?: any) => Promise<void>;
  selectDocument: (document: Document | null) => void;
  createDocument: (formData: FormData) => Promise<void>;
  updateDocument: (id: string, documentData: any) => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useDocumentStore = create<DocumentState>((set) => ({
  documents: [],
  selectedDocument: null,
  isLoading: false,
  error: null,

  fetchDocuments: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiService.getDocuments(params);
      set({
        documents: response.data.documents,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Error al cargar documentos',
        isLoading: false,
      });
    }
  },

  selectDocument: (document) => {
    set({ selectedDocument: document });
  },

  createDocument: async (formData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiService.uploadDocument(formData);
      const newDocument = response.data.document;
      set((state) => ({
        documents: [...state.documents, newDocument],
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Error al subir documento',
        isLoading: false,
      });
      throw error;
    }
  },

  updateDocument: async (id, documentData) => {
    set({ isLoading: true, error: null });
    try {
      // Assuming apiService.updateDocument exists or use general update
      // Since it's usually metadata update for documents
      const response = await apiService.request({
        method: 'PUT',
        url: `/documents/${id}`,
        data: documentData,
      });
      const updatedDocument = response.data.document;
      set((state) => ({
        documents: state.documents.map((d) =>
          d.id === id ? updatedDocument : d
        ),
        selectedDocument:
          state.selectedDocument?.id === id
            ? updatedDocument
            : state.selectedDocument,
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Error al actualizar documento',
        isLoading: false,
      });
      throw error;
    }
  },

  deleteDocument: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await apiService.request({ method: 'DELETE', url: `/documents/${id}` });
      set((state) => ({
        documents: state.documents.filter((d) => d.id !== id),
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Error al eliminar documento',
        isLoading: false,
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
