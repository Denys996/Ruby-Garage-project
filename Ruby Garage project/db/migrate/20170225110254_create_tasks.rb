class CreateTasks < ActiveRecord::Migration[5.0]
  def change
    create_table :tasks do |t|
      t.string :name
      t.integer :status, default: 0
      t.integer :priority
      t.references :project, foreign_key: true
      t.datetime :deadline

      t.timestamps
    end
  end
end
