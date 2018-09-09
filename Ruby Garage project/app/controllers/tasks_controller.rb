class TasksController < ApplicationController
  def create
    @task = Project.find(params[:project_id]).tasks.build(task_params)
    @task.status = 0
    @task.priority = 0
    if @task.save
      render @task
    else
      render partial: 'shared/error_messages', formats: [:html], locals: { object: @task }
    end
  end

  def update
    @task = Task.find(params[:id])
    if @task.update_attributes(task_params)
      if params[:setPriority] == "true"
        render @task.project.tasks;
      elsif !@task.deadline.nil?
        render partial: 'projects/deadline', formats: [:html], locals: { object: @task }
      else
        render nothing: true, status: 200
      end
    else
      render  partial: 'shared/error_messages', formats: [:html], locals: { object: @task }
    end
  end

  def destroy
    Task.find(params[:id]).destroy
    render plain: 'OK', status: 200
  end

  def change_priority(priority)

  end

  private
    def task_params
      params.require(:task).permit(:name, :status, :priority, :deadline)
    end
end
