class Task < ApplicationRecord
  belongs_to :project
  validates :project_id, presence: true
  validates :name, presence: true, length: { maximum: 250 }
  validates :priority, presence: true
  validates :status, presence: true
  default_scope ->{ order(priority: :desc) }
end
