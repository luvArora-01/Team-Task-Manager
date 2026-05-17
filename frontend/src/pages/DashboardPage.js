import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { format, isPast } from 'date-fns';
import { dashboardAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const StatCard = ({ label, value, caption, tone = 'neutral' }) => (
  <div className={`stat-card stat-${tone}`}>
    <div className="stat-info">
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      {caption && <div className="stat-caption">{caption}</div>}
    </div>
  </div>
);

const priorityColors = { low: 'priority-low', medium: 'priority-medium', high: 'priority-high', critical: 'priority-critical' };
const statusColors = { todo: 'status-todo', 'in-progress': 'status-in-progress', review: 'status-review', done: 'status-done' };

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardAPI.get()
      .then((res) => setData(res.data.dashboard))
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;
  if (!data) return null;

  const { projects, tasks, overdueTasks, myTasks, recentTasks } = data;
  const completionRate = tasks.total > 0 ? Math.round((tasks.done / tasks.total) * 100) : 0;
  const activeWork = (tasks.todo || 0) + (tasks['in-progress'] || 0) + (tasks.review || 0);

  return (
    <>
      <div className="page-header dashboard-header">
        <div>
          <span className="page-eyebrow">Today</span>
          <h1>Command Center</h1>
          <p>Welcome back, <strong>{user?.name}</strong>. Here is the current delivery picture.</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/projects')}>
          View Projects
        </button>
      </div>

      <div className="page-body">
        <section className="dashboard-hero">
          <div className="dashboard-hero-copy">
            <span className="page-eyebrow">Portfolio Health</span>
            <h2>{completionRate}% task completion</h2>
            <p>{activeWork} active tasks across {projects.total} projects, with {tasks.overdue} item{tasks.overdue === 1 ? '' : 's'} requiring attention.</p>
          </div>
          <div className="hero-metrics">
            <div>
              <span>{projects.active}</span>
              <small>Active projects</small>
            </div>
            <div>
              <span>{tasks.done}</span>
              <small>Tasks delivered</small>
            </div>
            <div>
              <span>{overdueTasks.length}</span>
              <small>Overdue</small>
            </div>
          </div>
        </section>

        <div className="stats-grid">
          <StatCard label="Total Projects" value={projects.total} caption={`${projects.active} active`} tone="teal" />
          <StatCard label="Total Tasks" value={tasks.total} caption={`${tasks.done} completed`} tone="indigo" />
          <StatCard label="In Progress" value={tasks['in-progress']} caption={`${tasks.review} in review`} tone="blue" />
          <StatCard label="Overdue" value={tasks.overdue} caption="Needs follow-up" tone="rose" />
          <StatCard label="To Do" value={tasks.todo} caption="Ready to start" tone="slate" />
          <StatCard label="Completion" value={`${completionRate}%`} caption="Overall delivery" tone="emerald" />
        </div>

        <div className="dashboard-grid">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">My Tasks</h3>
              <span className="badge badge-blue">{myTasks.length}</span>
            </div>
            {myTasks.length === 0 ? (
              <div className="compact-empty">
                <strong>No pending tasks</strong>
                <span>Your personal queue is clear.</span>
              </div>
            ) : (
              <div className="activity-list">
                {myTasks.map((task) => {
                  const overdue = task.dueDate && isPast(new Date(task.dueDate));
                  return (
                    <button
                      type="button"
                      key={task._id}
                      className={`activity-item ${overdue ? 'is-overdue' : ''}`}
                      onClick={() => navigate(`/projects/${task.project?._id}`)}
                    >
                      <span className="activity-title">{task.title}</span>
                      <span className="activity-meta">
                        <span className={`badge ${statusColors[task.status]}`}>{task.status}</span>
                        <span>{task.project?.name}</span>
                        {task.dueDate && <span>{format(new Date(task.dueDate), 'MMM d')}{overdue ? ' overdue' : ''}</span>}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Overdue Tasks</h3>
              <span className="badge badge-red">{overdueTasks.length}</span>
            </div>
            {overdueTasks.length === 0 ? (
              <div className="compact-empty">
                <strong>No overdue work</strong>
                <span>Delivery dates are under control.</span>
              </div>
            ) : (
              <div className="activity-list">
                {overdueTasks.map((task) => (
                  <button
                    type="button"
                    key={task._id}
                    className="activity-item is-overdue"
                    onClick={() => navigate(`/projects/${task.project?._id}`)}
                  >
                    <span className="activity-title">{task.title}</span>
                    <span className="activity-meta">
                      <span>Due {format(new Date(task.dueDate), 'MMM d, yyyy')}</span>
                      {task.assignee && <span>{task.assignee.name}</span>}
                      <span>{task.project?.name}</span>
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="card" style={{ marginTop: 24 }}>
          <div className="card-header">
            <h3 className="card-title">Recently Added Tasks</h3>
          </div>
          {recentTasks.length === 0 ? (
            <div className="empty-state" style={{ padding: '30px 0' }}>
              <p>No tasks created yet.</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Task</th>
                    <th>Project</th>
                    <th>Status</th>
                    <th>Priority</th>
                    <th>Assignee</th>
                    <th>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTasks.map((task) => (
                    <tr
                      key={task._id}
                      style={{ cursor: 'pointer' }}
                      onClick={() => navigate(`/projects/${task.project?._id}`)}
                    >
                      <td style={{ fontWeight: 600 }}>{task.title}</td>
                      <td style={{ color: 'var(--gray-500)' }}>{task.project?.name}</td>
                      <td><span className={`badge ${statusColors[task.status]}`}>{task.status}</span></td>
                      <td><span className={`badge ${priorityColors[task.priority]}`}>{task.priority}</span></td>
                      <td style={{ color: 'var(--gray-500)' }}>{task.assignee?.name || '-'}</td>
                      <td style={{ color: 'var(--gray-500)' }}>{format(new Date(task.createdAt), 'MMM d, yyyy')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
