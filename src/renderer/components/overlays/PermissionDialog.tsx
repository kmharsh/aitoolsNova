import React from 'react';
import '../../styles/components/PermissionDialog.css';

interface DialogProps {
  show: boolean;
  action: string;
}

export const PermissionDialog: React.FC<DialogProps> = ({ show, action }) => {
  if (!show) return null;

  return (
    <div className="permission-overlay">
      <div className="glass-panel permission-panel">
        <h3 className="permission-title">High Risk Action Detected</h3>
        <p className="permission-desc">NOVA is requesting permission to execute:</p>
        <div className="permission-action">
          {action}
        </div>
        <div className="flex-center gap-4">
          <button className="permission-btn-deny">Deny</button>
          <button className="permission-btn-allow">Allow</button>
        </div>
      </div>
    </div>
  );
};
