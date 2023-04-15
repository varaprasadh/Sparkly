// @ts-nocheck
import React, { useState } from 'react';
import { Button, Modal, Form, Input, Typography } from 'antd';
import styled from 'styled-components';
import { getFaviconUrl, isValidUrl } from '../../../Utils/index';
import { toast } from 'react-toastify';

const StyledModalFooter = styled.div`
    display:flex;
    justify-content: flex-end;
`;


export default function AddBookMarkForm({ open = false, onAddBookMark = () => {}, handleCancel = () => {}}) {
    const [title, setTitle] = useState("");
    const [link, setLink] = useState("");
    const [linkError, setLinkError] = useState(false);
    const [loading, setLoading] = useState(false);
    const addBookmark = async () => {

        const bookmark = {
            url: null,
            title: null,
            thumbnail: null,
        };
        bookmark.title = title.trim();
        bookmark.url = link.trim();
        // below code verify if the link components have atleast 2 parts, ie. google.com not just google
        if (!/(\w+)\.(\w+)/.test(bookmark.url)) {
            setLinkError(true);
            return;
        } else {
            setLink(false);
        }
        // check if the
        // sanitize bookmark.url, add http if not exists
        if (bookmark.url && !/^(?:\w+:)?\/\/(\S+)$/.test(bookmark.url)) {
            // If the value is not a valid URL, add the "http://" protocol
            bookmark.url = `http://${bookmark.url}`;
        }
        if (!isValidUrl(bookmark.url)) {
            setLinkError(true);
            return;
        } else {
            setLinkError(false);
        }

        const url = new URL(bookmark.url);
        if (bookmark.title === '') {
            bookmark.title = url.hostname;
        }

        try {
            setLoading(true);
            bookmark.thumbnail = await getFaviconUrl(url.hostname);
            setLoading(false);
        } catch(error) {
            toast.error("Something went wrong, Try again!")
            setLoading(false);
            return;
        }
        onAddBookMark(bookmark);
    }
    return (
        <Modal title="Add Bookmark" open={open} footer={null} onCancel={handleCancel} confirmLoading={true}>
            
            <Form style={{marginTop:'1rem'}}>
                <Form.Item
                    label="Title"
                    rules={[{ required: true, message: 'Please input your username!' }]}
                >
                    <Input placeholder="i.e. Google" onChange={e => setTitle(e.target.value)} />
                </Form.Item>

                <Form.Item
                    label="Link"
                    rules={[{ required: true, message: 'Please input your link!' }]}
                >
                    <Input placeholder="i.e. google.com" onChange={e => setLink(e.target.value)} />
                </Form.Item>
                {linkError && <Typography.Text type="danger">Looks like the link is invalid.</Typography.Text>}
            </Form>
            <StyledModalFooter>
                <Button type="primary" onClick={addBookmark} loading={loading}>Save</Button>
            </StyledModalFooter>
        </Modal>
    )
}