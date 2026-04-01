import { useState } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Badge } from './Badge';
import { 
  AlertCircle, 
  Trash2,
  Save
} from 'lucide-react';

export function ModalExample() {
  const [basicModal, setBasicModal] = useState(false);
  const [smallModal, setSmallModal] = useState(false);
  const [largeModal, setLargeModal] = useState(false);
  const [fullModal, setFullModal] = useState(false);
  const [footerModal, setFooterModal] = useState(false);
  const [confirmModal, setConfirmModal] = useState(false);
  const [formModal, setFormModal] = useState(false);
  const [noCloseModal, setNoCloseModal] = useState(false);
  const [alertModal, setAlertModal] = useState(false);

  return (
    <div className="p-8 space-y-8 bg-gray-50">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Modal Component Examples</h2>
        <p className="text-gray-600 mb-6">Enhanced reusable modal with various configurations</p>
      </div>

      {/* Basic Modals */}
      <div className="bg-white rounded-lg p-6 shadow">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Basic Modals</h3>
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => setBasicModal(true)}>
            Basic Modal
          </Button>
          <Button variant="secondary" onClick={() => setAlertModal(true)}>
            Alert Modal
          </Button>
          <Button variant="outline" onClick={() => setConfirmModal(true)}>
            Confirm Modal
          </Button>
        </div>
      </div>

      {/* Sizes */}
      <div className="bg-white rounded-lg p-6 shadow">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Modal Sizes</h3>
        <div className="flex flex-wrap gap-3">
          <Button size="sm" onClick={() => setSmallModal(true)}>
            Small Modal
          </Button>
          <Button onClick={() => setBasicModal(true)}>
            Medium Modal
          </Button>
          <Button onClick={() => setLargeModal(true)}>
            Large Modal
          </Button>
          <Button onClick={() => setFullModal(true)}>
            Full Modal
          </Button>
        </div>
      </div>

      {/* With Footer */}
      <div className="bg-white rounded-lg p-6 shadow">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">With Footer Actions</h3>
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => setFooterModal(true)}>
            Modal with Footer
          </Button>
          <Button variant="outline" onClick={() => setFormModal(true)}>
            Form Modal
          </Button>
        </div>
      </div>

      {/* Special Behaviors */}
      <div className="bg-white rounded-lg p-6 shadow">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Special Behaviors</h3>
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" onClick={() => setNoCloseModal(true)}>
            No Backdrop Close
          </Button>
        </div>
      </div>

      {/* Basic Modal */}
      <Modal
        isOpen={basicModal}
        onClose={() => setBasicModal(false)}
        title="Basic Modal"
      >
        <p className="text-gray-700">
          This is a basic modal with default settings. You can close it by clicking the X button,
          clicking outside the modal, or pressing the Escape key.
        </p>
      </Modal>

      {/* Small Modal */}
      <Modal
        isOpen={smallModal}
        onClose={() => setSmallModal(false)}
        title="Small Modal"
        size="sm"
      >
        <p className="text-gray-700">
          This is a small modal, perfect for simple messages or confirmations.
        </p>
      </Modal>

      {/* Large Modal */}
      <Modal
        isOpen={largeModal}
        onClose={() => setLargeModal(false)}
        title="Large Modal"
        size="lg"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            This is a large modal with more content space. It's ideal for forms, detailed information,
            or complex interactions.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-2">Feature 1</h4>
              <p className="text-sm text-gray-600">Description of feature 1</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-2">Feature 2</h4>
              <p className="text-sm text-gray-600">Description of feature 2</p>
            </div>
          </div>
        </div>
      </Modal>

      {/* Full Modal */}
      <Modal
        isOpen={fullModal}
        onClose={() => setFullModal(false)}
        title="Full Width Modal"
        size="full"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            This is a full-width modal that takes up most of the screen width. Perfect for
            dashboards, data tables, or complex layouts.
          </p>
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-2">Card {i}</h4>
                <p className="text-sm text-gray-600">Content for card {i}</p>
              </div>
            ))}
          </div>
        </div>
      </Modal>

      {/* Modal with Footer */}
      <Modal
        isOpen={footerModal}
        onClose={() => setFooterModal(false)}
        title="Modal with Footer"
        footer={
          <>
            <Button variant="outline" onClick={() => setFooterModal(false)}>
              Cancel
            </Button>
            <Button onClick={() => setFooterModal(false)}>
              Save Changes
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            This modal includes a footer section with action buttons. The footer has a subtle
            background to separate it from the content.
          </p>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Setting 1
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter value"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Setting 2
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter value"
              />
            </div>
          </div>
        </div>
      </Modal>

      {/* Confirm Modal */}
      <Modal
        isOpen={confirmModal}
        onClose={() => setConfirmModal(false)}
        title="Confirm Action"
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setConfirmModal(false)}>
              Cancel
            </Button>
            <Button variant="secondary" icon={<Trash2 className="w-4 h-4" />} onClick={() => setConfirmModal(false)}>
              Delete
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-secondary/10 rounded-lg">
            <AlertCircle className="w-6 h-6 text-secondary flex-shrink-0" />
            <p className="text-gray-700">
              Are you sure you want to delete this item? This action cannot be undone.
            </p>
          </div>
        </div>
      </Modal>

      {/* Form Modal */}
      <Modal
        isOpen={formModal}
        onClose={() => setFormModal(false)}
        title="Create New Item"
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setFormModal(false)}>
              Cancel
            </Button>
            <Button icon={<Save className="w-4 h-4" />} onClick={() => setFormModal(false)}>
              Create Item
            </Button>
          </>
        }
      >
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Item Name <span className="text-secondary">*</span>
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Enter item name"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              rows={4}
              placeholder="Enter description"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
                <option>Select category</option>
                <option>Category 1</option>
                <option>Category 2</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
                <option>Active</option>
                <option>Inactive</option>
              </select>
            </div>
          </div>
        </form>
      </Modal>

      {/* No Backdrop Close Modal */}
      <Modal
        isOpen={noCloseModal}
        onClose={() => setNoCloseModal(false)}
        title="Important Action Required"
        size="sm"
        closeOnBackdropClick={false}
        closeOnEscape={false}
        footer={
          <>
            <Button variant="outline" onClick={() => setNoCloseModal(false)}>
              Cancel
            </Button>
            <Button onClick={() => setNoCloseModal(false)}>
              Confirm
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0" />
            <p className="text-gray-700">
              This modal requires explicit action. You cannot close it by clicking outside or pressing Escape.
            </p>
          </div>
        </div>
      </Modal>

      {/* Alert Modal with Secondary Color */}
      <Modal
        isOpen={alertModal}
        onClose={() => setAlertModal(false)}
        title="Critical Alert"
        size="sm"
        footer={
          <Button variant="secondary" fullWidth onClick={() => setAlertModal(false)}>
            Acknowledge
          </Button>
        }
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-secondary/10 rounded-lg border border-secondary/20">
            <AlertCircle className="w-6 h-6 text-secondary flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">System Alert</h4>
              <p className="text-gray-700 text-sm">
                A critical issue has been detected. Please review and take appropriate action immediately.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" dot>High Priority</Badge>
            <Badge variant="gray" size="sm">Requires Action</Badge>
          </div>
        </div>
      </Modal>
    </div>
  );
}
