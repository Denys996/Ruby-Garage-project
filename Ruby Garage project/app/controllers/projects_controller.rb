class ProjectsController < ApplicationController
  def index
    @projects = Project.all

  end

  def create
    @project = Project.new(project_params)
    if @project.save
      render @project
    else
      render  partial: 'shared/error_messages', formats: [:html], locals: { object: @project }
    end

  end

  def update
    @project = Project.find(params[:id])
    if @project.update_attributes(project_params)
      "success"
    else
      render  partial: 'shared/error_messages', formats: [:html], locals: { object: @project }
    end
  end

  def destroy
    Project.find(params[:id]).destroy
    render plain: 'OK', status: 200
  end

  private

    def project_params
      params.require(:project).permit(:name)
    end

end
