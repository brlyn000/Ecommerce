# Modal Components Usage

## 1. Basic Modal

```jsx
import { useState } from 'react';
import Modal from './components/Modal';

function App() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Open Modal</button>
      
      <Modal 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)}
        title="Modal Title"
        size="md" // sm, md, lg, xl
      >
        <p>Your content here</p>
      </Modal>
    </>
  );
}
```

## 2. Confirm Modal

```jsx
import { useState } from 'react';
import ConfirmModal from './components/ConfirmModal';

function App() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Delete Item</button>
      
      <ConfirmModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={() => console.log('Confirmed!')}
        title="Confirm Delete"
        message="Are you sure you want to delete this item?"
        type="warning" // success, error, warning, info
        confirmText="Delete"
        cancelText="Cancel"
      />
    </>
  );
}
```

## 3. Replace alert() with ConfirmModal in Profile.jsx

```jsx
// Before
const handleSave = async () => {
  if (!confirm('Are you sure?')) return;
  // save logic
};

// After
const [showConfirm, setShowConfirm] = useState(false);

const handleSave = async () => {
  setShowConfirm(true);
};

const confirmSave = async () => {
  // save logic here
};

// In JSX
<ConfirmModal
  isOpen={showConfirm}
  onClose={() => setShowConfirm(false)}
  onConfirm={confirmSave}
  title="Save Changes"
  message="Are you sure you want to save these changes?"
  type="info"
  confirmText="Save"
  cancelText="Cancel"
/>
```

## Features

- ✅ Smooth animations (fadeIn, slideUp)
- ✅ Backdrop blur effect
- ✅ Multiple sizes (sm, md, lg, xl)
- ✅ Different types (success, error, warning, info)
- ✅ Responsive design
- ✅ Body scroll lock when open
- ✅ Click outside to close
