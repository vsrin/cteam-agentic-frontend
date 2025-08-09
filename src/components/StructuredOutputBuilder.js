import React, { useState, useEffect } from 'react';
import { PlusCircle, Trash2 } from 'lucide-react';
import './StructuredOutputBuilder.css';

const StructuredOutputBuilder = ({ onChange, disabled, structuredOutputSchema }) => {
    const [mainResult, setMainResult] = useState({ required: true, description: 'The content as it is.' });
    // Initialize with one dummy metadata field so UI always shows a row
    const [metadataFields, setMetadataFields] = useState([{
        name: 'Dummy',
        type: 'string',
        required: false,
        description: 'you can right description here'
    }]);

    // Hydrate state from incoming schema
    useEffect(() => {
        if (!structuredOutputSchema) return;
        try {
            const parsed = JSON.parse(structuredOutputSchema).structured_output;
            const hasResultReq = Array.isArray(parsed.required) && parsed.required.includes('result');
            setMainResult({
                description: parsed.properties.result.description || mainResult.description,
                required: hasResultReq
            });

            const meta = parsed.properties.metadata || {};
            const props = meta.properties || {};
            const reqList = Array.isArray(meta.required) ? meta.required : [];
            const fields = Object.entries(props).map(([name, def]) => ({
                name,
                type: def.type,
                required: reqList.includes(name),
                description: def.description || ''
            }));

            // If no fields in schema, keep dummy row
            setMetadataFields(fields.length ? fields : [{ name: '', type: 'string', required: false, description: '' }]);
        } catch (e) {
            console.warn('Invalid structuredOutputSchema JSON', e);
        }
    }, []);

    // Emit schema on changes
    useEffect(() => {
        const metadataProperties = {};
        const metadataRequired = [];
        metadataFields.forEach(f => {
            if (!f.name) return; // skip empty dummy
            metadataProperties[f.name] = { type: f.type };
            if (f.description) metadataProperties[f.name].description = f.description;
            if (f.required) metadataRequired.push(f.name);
        });

        const schema = {
            structured_output: {
                title: 'StructuredOutput', // ✅ Add title
                description: 'Structured output containing result and metadata.', // ✅ Add description
                type: 'object',
                properties: {
                    result: { type: 'string', description: mainResult.description },
                    metadata: { type: 'object', properties: metadataProperties, required: metadataRequired }
                },
                required: mainResult.required ? ['result'] : []
            }
        };
        onChange(JSON.stringify(schema, null, 2));
    }, [mainResult, metadataFields, onChange]);

    const addMetadataField = () => setMetadataFields(fields => [
        ...fields,
        { name: '', type: 'string', required: false, description: '' }
    ]);

    const removeMetadataField = i => setMetadataFields(fields => fields.filter((_, idx) => idx !== i));
    const updateField = (i, prop, val) => setMetadataFields(fields => fields.map((f, idx) => idx === i ? { ...f, [prop]: val } : f));

    return (
        <div className="builder">
            <div className="card">
                <div className="card-header flex-between">
                    <h3>Fields</h3>
                    <button className="btn icon-btn" onClick={addMetadataField} disabled={disabled} title="Add Field">
                        <PlusCircle size={20} />
                    </button>
                </div>
                <div className="card-body">
                    {metadataFields.map((f, i) => (
                        <div key={i} className="metadata-row">
                            <div className="field">
                                <label>Field Name</label>
                                <input type="text" value={f.name} onChange={e => updateField(i, 'name', e.target.value)} disabled={disabled} />
                            </div>
                            <div className="field">
                                <label>Description</label>
                                <input
                                    type="text"
                                    value={f.description}
                                    onChange={e => updateField(i, 'description', e.target.value)}
                                    disabled={disabled}
                                />
                            </div>
                            <div className="field">
                                <label>Type</label>
                                <select value={f.type} onChange={e => updateField(i, 'type', e.target.value)} disabled={disabled}>
                                    <option value="string">String</option>
                                    <option value="number">Number</option>
                                    <option value="boolean">Boolean</option>
                                    <option value="array">Array</option>
                                    <option value="object">Object</option>
                                </select>
                            </div>
                            <label className="checkbox-label">
                                <input type="checkbox" checked={f.required} onChange={e => updateField(i, 'required', e.target.checked)} disabled={disabled} />
                                Required
                            </label>
                            <button className="btn btn-danger icon-btn" onClick={() => removeMetadataField(i)} disabled={disabled} title="Remove Field">
                                <Trash2 size={18} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default StructuredOutputBuilder;