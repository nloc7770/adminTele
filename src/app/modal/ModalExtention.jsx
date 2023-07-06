import React, { useState } from 'react';
import { Modal, Space, DatePicker } from 'antd';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
dayjs.extend(customParseFormat);

const ModalExtention = ({ open, onClose, onConfirm }) => {

    const [dateExtention, setDateExtention] = useState(null)

    const disabledDate = (current) => {
        // Can not select days before today and today
        return current && current < dayjs().endOf('day');
    };

    const onChangeDate = (date, dateString) => {
        setDateExtention(date)
    };


    return (
        <React.Fragment>

            <Modal title="Cập nhật thời hạn"
                open={open}
                onOk={() => onConfirm(dateExtention)}
                onCancel={onClose}
                bodyStyle={{ height: 100, display: 'flex', justifyContent: 'center', flexDirection: "column" }}
            >
                <div >
                    <DatePicker
                        disabledDate={disabledDate}
                        onChange={onChangeDate}
                        style={{ width: '100%' }}
                        placeholder='Chọn ngày gia hạn'
                        format="DD-MM-YYYY"
                        showToday={false}
                    />
                </div>

            </Modal>
        </React.Fragment>
    );
};

export default ModalExtention;