import api from './axios';
class InstructionsService {
    /**
     * List instructions with pagination, search, and filters
     * Backend: GET /api/v1/admin/instructions
     */
    async listInstructions(filters) {
        try {
            const response = await api.get('/admin/instructions', {
                params: filters,
            });
            return response.data;
        }
        catch (error) {
            console.error('Error fetching instructions:', error);
            throw error;
        }
    }
    /**
     * Get instruction by ID
     * Backend: GET /api/v1/admin/instructions/:id
     */
    async getInstruction(id) {
        try {
            const response = await api.get(`/admin/instructions/${id}`);
            return response.data.data;
        }
        catch (error) {
            console.error('Error fetching instruction:', error);
            throw error;
        }
    }
    /**
     * Create new instruction
     * Backend: POST /api/v1/admin/instructions
     */
    async createInstruction(data) {
        try {
            const response = await api.post('/admin/instructions', data);
            return response.data.data;
        }
        catch (error) {
            console.error('Error creating instruction:', error);
            throw error;
        }
    }
    /**
     * Update instruction by ID
     * Backend: PUT /api/v1/admin/instructions/:id
     */
    async updateInstruction(id, data) {
        try {
            const response = await api.put(`/admin/instructions/${id}`, data);
            return response.data.data;
        }
        catch (error) {
            console.error('Error updating instruction:', error);
            throw error;
        }
    }
    /**
     * Soft delete instruction by ID
     * Backend: DELETE /api/v1/admin/instructions/:id
     */
    async deleteInstruction(id) {
        try {
            await api.delete(`/admin/instructions/${id}`);
        }
        catch (error) {
            console.error('Error deleting instruction:', error);
            throw error;
        }
    }
    /**
     * Get soft-deleted instructions
     * Backend: GET /api/v1/admin/instructions/deleted
     */
    async getDeletedInstructions(filters) {
        try {
            const response = await api.get('/admin/instructions/deleted', {
                params: filters,
            });
            return response.data;
        }
        catch (error) {
            console.error('Error fetching deleted instructions:', error);
            throw error;
        }
    }
    /**
     * Restore soft-deleted instruction
     * Backend: PATCH /api/v1/admin/instructions/:id/restore
     */
    async restoreInstruction(id) {
        try {
            const response = await api.patch(`/admin/instructions/${id}/restore`);
            return response.data.data;
        }
        catch (error) {
            console.error('Error restoring instruction:', error);
            throw error;
        }
    }
    /**
     * Permanently delete instruction (hard delete)
     * Backend: DELETE /api/v1/admin/instructions/:id/permanent
     */
    async permanentDeleteInstruction(id) {
        try {
            await api.delete(`/admin/instructions/${id}/permanent`);
        }
        catch (error) {
            console.error('Error permanently deleting instruction:', error);
            throw error;
        }
    }
}
export default new InstructionsService();
