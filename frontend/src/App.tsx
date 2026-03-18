import { useState, useEffect } from 'react'
import type { Project, ProjectFormType } from './types'
import './App.css'
import { ProjectForm } from './ProjectForm'

function App() {
  const [projects, setProjects] = useState<Project[]>([])
  const [view, setView] = useState('list')

  const renderContent = () => {
    switch (view){
      case 'list':
        return <section>
          <h1>Projects</h1>
          <button onClick={() => setView('add')}>Add New Project</button>
          {projects.length === 0 ? (
            <p>No projects found yet.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Start</th>
                  <th>End</th>
                  <th>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project) => (
                  <tr key={project.id}>
                    <td>{project.id}</td>
                    <td>{project.name}</td>
                    <td>{project.description}</td>
                    <td>{new Date(project.start).toLocaleDateString()}</td>
                    <td>{new Date(project.end).toLocaleDateString()}</td>
                    <td>{project.revenue.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
      </section>
      case 'add':
        return <ProjectForm
          onSuccess={()=>{
            fetchProjects()
            setView('list')
          }}
          onFail={()=>{
            alert("Failed to save")
          }}
          onCancel={()=>{
            setView('list')
          }}
        />
    }
  }

  const fetchProjects = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/projects')
      const data: Project[] = await response.json()
      setProjects(data)
    } catch (error) {
      console.error('Error fetching projects:', error)
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [])

  

  return (
    <div className="App">
      {renderContent()}
    </div>
  )
}


export default App