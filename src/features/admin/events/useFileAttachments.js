import { useState, useCallback } from 'react';
import * as attachmentsService from './attachmentsService';
export function useFileAttachments(eventId) {
    const [state, setState] = useState({
        attachments: [],
        loading: false,
        error: null,
    });
    const upload = useCallback(async (file) => {
        setState((s) => ({ ...s, loading: true, error: null }));
        try {
            const attachment = await attachmentsService.uploadAttachment(eventId, file);
            setState((s) => ({
                ...s,
                attachments: [...s.attachments, attachment],
                loading: false,
            }));
            return attachment;
        }
        catch (err) {
            const message = err?.response?.data?.message ?? err?.message ?? 'Failed to upload attachment.';
            setState((s) => ({ ...s, loading: false, error: message }));
            throw err;
        }
    }, [eventId]);
    const remove = useCallback(async (attachmentId) => {
        setState((s) => ({ ...s, loading: true, error: null }));
        try {
            await attachmentsService.deleteAttachment(eventId, attachmentId);
            setState((s) => ({
                ...s,
                attachments: s.attachments.filter((a) => a.id !== attachmentId),
                loading: false,
            }));
        }
        catch (err) {
            const message = err?.response?.data?.message ?? err?.message ?? 'Failed to remove attachment.';
            setState((s) => ({ ...s, loading: false, error: message }));
            throw err;
        }
    }, [eventId]);
    return {
        attachments: state.attachments,
        loading: state.loading,
        error: state.error,
        upload,
        remove,
    };
}
