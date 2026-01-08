"use client";

import React, { useState, useCallback, useMemo } from 'react';
import {
    ReactFlow,
    MiniMap,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    addEdge,
    Handle,
    Position,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { supabase } from '@/lib/supabase';
import styles from './EmailListManager.module.css';
import { useToast } from './Toaster';

// Custom Question Node
const QuestionNode = ({ data, id }: any) => {
    const isChoiceType = data.type === 'radio' || data.type === 'multi';

    return (
        <div style={{ padding: '8px', borderRadius: '8px', background: '#fff', border: '1px solid #eaeaea', width: '180px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <Handle type="target" position={Position.Left} style={{ background: '#6366f1', width: '6px', height: '6px' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <div style={{ fontSize: '0.55rem', fontWeight: 800, color: '#6366f1', textTransform: 'uppercase' }}>
                    Question
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '2px', cursor: 'pointer', fontSize: '0.55rem', color: '#999' }}>
                    <input
                        type="checkbox"
                        checked={data.required || false}
                        onChange={(e) => data.onChange(id, 'required', e.target.checked)}
                        style={{ width: '8px', height: '8px' }}
                    />
                    Req
                </label>
            </div>

            <div style={{ marginBottom: '6px' }}>
                <input
                    style={{ width: '100%', border: 'none', fontSize: '0.75rem', fontWeight: 600, padding: '1px 0', outline: 'none' }}
                    value={data.question || ''}
                    placeholder="Title..."
                    onChange={(e) => data.onChange(id, 'question', e.target.value)}
                />
            </div>

            <div style={{ marginBottom: '6px' }}>
                <select
                    style={{ width: '100%', padding: '2px', fontSize: '0.65rem', borderRadius: '4px', border: '1px solid #ddd' }}
                    value={data.type || 'text'}
                    onChange={(e) => data.onChange(id, 'type', e.target.value)}
                >
                    <option value="text">Short Text</option>
                    <option value="long_text">Long Text</option>
                    <option value="email">Email</option>
                    <option value="phone">Phone Number</option>
                    <option value="integer">Number</option>
                    <option value="radio">Single Choice</option>
                    <option value="multi">Multi Choice</option>
                </select>
            </div>

            {
                isChoiceType && (
                    <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '6px', maxHeight: '80px', overflowY: 'auto' }}>
                        {(data.options || []).map((opt: string, idx: number) => (
                            <div key={idx} style={{ display: 'flex', gap: '2px', marginBottom: '2px' }}>
                                <input
                                    style={{ flex: 1, padding: '1px 3px', fontSize: '0.65rem', border: '1px solid #eee', borderRadius: '3px' }}
                                    value={opt}
                                    onChange={(e) => {
                                        const newOpts = [...(data.options || [])];
                                        newOpts[idx] = e.target.value;
                                        data.onChange(id, 'options', newOpts);
                                    }}
                                />
                                <button
                                    onClick={() => {
                                        const newOpts = (data.options || []).filter((_: any, i: number) => i !== idx);
                                        data.onChange(id, 'options', newOpts);
                                    }}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ff4d4f', fontSize: '0.6rem' }}
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                        <button
                            onClick={() => {
                                const newOpts = [...(data.options || []), 'New Option'];
                                data.onChange(id, 'options', newOpts);
                            }}
                            style={{ width: '100%', padding: '2px', fontSize: '0.5rem', background: '#f5f5f5', border: '1px dashed #ccc', borderRadius: '4px', cursor: 'pointer' }}
                        >
                            + Option
                        </button>
                    </div>
                )
            }

            <Handle type="source" position={Position.Right} style={{ background: '#6366f1', width: '6px', height: '6px' }} />
        </div >
    );
};

const StartNode = ({ data }: any) => {
    return (
        <div style={{ padding: '12px 16px', borderRadius: '10px', background: '#171717', color: '#fff', width: '160px', textAlign: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: '0.55rem', fontWeight: 800, color: '#6366f1', textTransform: 'uppercase', marginBottom: '2px' }}>Welcome Screen</div>
            <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>{data.label}</div>
            <Handle type="source" position={Position.Right} style={{ background: '#6366f1', width: '6px', height: '6px' }} />
        </div>
    );
};

const nodeTypes = {
    question: QuestionNode,
    start: StartNode,
};

export function FormFlowEditor({ campaign, onClose }: { campaign: any, onClose: () => void }) {
    const { toast } = useToast();
    const initialNodes = useMemo(() => {
        if (!campaign || !campaign.flow_data) return [];
        const nodes = campaign.flow_data.nodes || [];
        return nodes.map((node: any) => ({
            ...node,
            data: {
                ...node.data,
                onChange: (nodeId: string, field: string, value: string) => handleNodeDataChange(nodeId, field, value)
            }
        }));
    }, [campaign]);

    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(campaign?.flow_data?.edges || []);
    const [saving, setSaving] = useState(false);

    const handleNodeDataChange = useCallback((nodeId: string, field: string, value: string) => {
        setNodes((nds) =>
            nds.map((node) => {
                if (node.id === nodeId) {
                    return {
                        ...node,
                        data: {
                            ...node.data,
                            [field]: value,
                        },
                    };
                }
                return node;
            })
        );
    }, [setNodes]);

    const onConnect = useCallback(
        (params: any) => setEdges((eds) => addEdge(params, eds)),
        [setEdges]
    );

    if (!campaign) return <div style={{ padding: '60px', textAlign: 'center' }}>Synchronizing campaign data...</div>;

    const addQuestionNode = () => {
        // Find the rightmost node to determine new position
        let rightmostNode = nodes[0];
        nodes.forEach(node => {
            if (node.position.x > rightmostNode.position.x) {
                rightmostNode = node;
            }
        });

        const newNodeId = `question-${Date.now()}`;
        const newNode = {
            id: newNodeId,
            type: 'question',
            position: {
                x: rightmostNode.position.x + 220,
                y: rightmostNode.position.y
            },
            data: {
                question: 'New Question',
                type: 'text',
                required: false,
                onChange: handleNodeDataChange
            },
        };

        setNodes((nds) => nds.concat(newNode));

        // Auto-connect from the rightmost node to the new node
        const newEdge = {
            id: `e-${rightmostNode.id}-${newNodeId}`,
            source: rightmostNode.id,
            target: newNodeId,
            animated: true,
            style: { stroke: '#6366f1', strokeWidth: 2 }
        };
        setEdges((eds) => eds.concat(newEdge));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const { error } = await supabase
                .from('survey_campaigns')
                .update({
                    flow_data: { ...campaign.flow_data, nodes, edges, type: 'interactive' }
                })
                .eq('id', campaign.id);

            if (error) throw error;
            toast("Flow saved successfully!", "success");
        } catch (err) {
            console.error("Error saving flow:", err);
            toast("Failed to save flow.", "error");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div style={{ height: 'calc(100vh - 120px)', position: 'relative', background: '#f8fafc', borderRadius: '24px', overflow: 'hidden', border: '1px solid #eaeaea' }}>
            <div style={{ position: 'absolute', top: '20px', left: '20px', zIndex: 10, display: 'flex', gap: '10px' }}>
                <button className={styles.button} onClick={addQuestionNode}>+ Add Question</button>
                <button className={styles.button} onClick={handleSave} disabled={saving}>
                    {saving ? 'Saving...' : 'Save Flow'}
                </button>
                <button className={`${styles.button} ${styles.secondaryButton}`} onClick={onClose}>Exit Editor</button>
            </div>

            <div style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 10 }}>
                <div style={{ padding: '10px 16px', background: 'white', borderRadius: '12px', border: '1px solid #eaeaea', fontSize: '0.875rem', fontWeight: 600 }}>
                    Editing: {campaign.title}
                </div>
            </div>

            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                nodeTypes={nodeTypes}
                minZoom={0.4}
                maxZoom={1.5}
                fitView
            >
                <Controls />
                <MiniMap />
                <Background color="#aaa" gap={20} />
            </ReactFlow>
        </div>
    );
}
