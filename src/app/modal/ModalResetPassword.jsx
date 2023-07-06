import React, { useState } from 'react';
import { Modal, Input } from 'antd';


const ModalResetPassword = ({ open, onClose, onConfirm }) => {

    const [newPassword, setNewPassword] = useState(null)

    const onChangePassword = ({ target: { value } }) => {
        
        setNewPassword(value)
    };


    return (
        <React.Fragment>

            <Modal title="Cập nhật mật khẩu"
                open={open}
                onOk={() => onConfirm(newPassword)}
                onCancel={onClose}
                bodyStyle={{ height: 100, display: 'flex', justifyContent: 'center', flexDirection: "column" }}
            >

                <Input onChange={onChangePassword} placeholder='Nhập mật khẩu mới' />

            </Modal>
        </React.Fragment>
    );
};

export default ModalResetPassword;