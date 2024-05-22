import React, { useEffect, useState } from 'react';
import { Card, Typography } from 'antd';
import moment from 'moment';
import Draggable from 'react-draggable';

const { Title, Text } = Typography;

const LocalDateTime = () => {
    const [currentTime, setCurrentTime] = useState(moment());

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(moment());
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    return (
        <Draggable>
            <Card style={{ width: 300, textAlign: 'center', margin: '0 auto' }}>
                <Text strong style={{ fontSize: '24px' }}>
                    {currentTime.format('hh:mm A')}
                </Text>
                <br />
                <Text type="secondary">
                    {currentTime.format('dddd, MMMM Do YYYY')}
                </Text>
            </Card>
        </Draggable>
    );
};

export default LocalDateTime;

