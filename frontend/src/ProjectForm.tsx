import type { ProjectFormType, ReturnProp } from './types'
import { useState } from 'react'
import './ProjectForm.css'


const initialForm: ProjectFormType = {
    name: '',
    description: '',
    start: '',
    end: '',
    revenue: 0
};

export const ProjectForm=({onSuccess,onFail,onCancel}: ReturnProp) => {
    const [formData, setFormData] = useState<ProjectFormType>(initialForm);

    const handleSave = async (e: React.SyntheticEvent) => {
        e.preventDefault();
        try {
            const response = await fetch('http://127.0.0.1:8000/projects', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(formData)
        });
            if (response.ok) {
                onSuccess();
                setFormData(initialForm)
            }
            else{
                onFail?.()
            }
        }
        catch(error) {
            console.error('Error saving project:', error)
            onFail?.()
        }
    }

    return (
        <div>
            <section>
            <h1>Add New Project</h1>
            <button type='button' onClick={onCancel}>Back to list</button>
            <form onSubmit={handleSave}>
                <input type="text" placeholder="Name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
                <textarea placeholder="Description" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} required />
                <input type="date" placeholder="Start Date" value={formData.start} onChange={(e) => setFormData({...formData, start: e.target.value})} required />
                <input type="date" placeholder="End Date" value={formData.end} onChange={(e) => setFormData({...formData, end: e.target.value})} required />
                <input type="number" placeholder="Revenue" value={formData.revenue} onChange={(e) => setFormData({...formData, revenue: parseFloat(e.target.value)})} required />
                <button type="submit">Save</button>
            </form>
            </section>
        </div>
    )

}
