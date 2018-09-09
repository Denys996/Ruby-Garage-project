// This is a manifest file that'll be compiled into application.js, which will include all the files
// listed below.
//
// Any JavaScript/Coffee file within this directory, lib/assets/javascripts, vendor/assets/javascripts,
// or any plugin's vendor/assets/javascripts directory can be referenced here using a relative path.
//
// It's not advisable to add code directly here, but if you do, it'll appear at the bottom of the
// compiled file. JavaScript code in this file should be added after the last require_* statement.
//
// Read Sprockets README (https://github.com/rails/sprockets#sprockets-directives) for details
// about supported directives.
//
//= require jquery
//= require jquery.turbolinks
//= require jquery_ujs
//= require bootstrap.min.js
//= require moment
//= require bootstrap-datetimepicker
//= require turbolinks
//= require_tree .



$(document).ready(function() {
//$(document).on("turbolinks:load", function() {
    $('#addProjectModal').on('show.bs.modal', function (event) {
        var button = $(event.relatedTarget); // Button that triggered the modal
        var target = button.data('actiontarget'); // Extract info from data-* attributes
        var modal = $(this);
        if (target != undefined) {
            var name = $("#project-name-" + target).text();
            $('#project-name-input').val(name);
            modal.find('.modal-title').text('Update project "' + name + '"');
            $('#addProjectModalButton').text("Update");
        } else {
            $('#project-name-input').val('');
            modal.find('.modal-title').text('New project');
            $('#addProjectModalButton').text("Create");
        }

        $('#error_explanation').remove();

        // adding/editing project from modal
        $('#addProjectModalButton').off('click').click(function(){

            if ($('#project-name-input').val() == "" || $('#project-name-input').val().length > 64) {
                $('#error_explanation').remove();
                modal.find('.form-control-label').before('<div id="error_explanation"><div class="alert alert-danger">Enter correct name(non-empty, less then 64 characters.)</div></div>');
                return
            }

            if ($('#addProjectModalButton').text() == "Create") {
                $.post("/projects",
                {
                        project: {
                            name: $('#project-name-input').val()
                        }
                    },
                    function (data, status) {
                        if (status == "success") {
                            if (/error_explanation/.test(data)) {
                                modal.find('.form-control-label').before(data);
                            } else {
                                $('.projects-placeholder').remove();
                                $('#addProjectButton').before(data);
                                $('#project-name-input').val('');
                                $('#addProjectModal').modal('hide');
                            }

                        } else {
                            modal.find('.form-control-label').before("Error");
                        }
                    });
            } else {
                $.ajax({url: "/projects/" + target,
                        type: 'PATCH',
                        data: {
                            project: {
                                name: $('#project-name-input').val()
                            }
                        },
                        success: function (data, status) {
                            if (/error_explanation/.test(data)) {
                                $('#error_explanation').remove();
                                modal.find('.form-control-label').before(data);
                            } else {
                                $("#project-name-" + target).text($('#project-name-input').val());
                                $('#addProjectModal').modal('hide');
                            }
                        }
                })
            }
        });
    });

    //deleting project
    $(document).on("ajax:success", 'a.project-delete-link', function (event, data, status, xhr) {
        $('#project-' + $(this).attr("data-actiontarget")).remove();
        console.log($('.project'));
        if ($('.project').length == 0) {
            $('#addProjectButton').before('<h2 class="text-center projects-placeholder">There\'s no projects left, create one.</h2>');
        }
    });


    $('[data-toggle="tooltip"]').tooltip();
    //adding task
    $(document).on("ajax:success", 'form#new-task', function (event, data, status, xhr) {
        var project_id = $(this).find('input[name="project_id"]').val();
        if (/error_explanation/.test(data)) {
            var tooltip = $(this).find('[data-toggle="tooltip"]');
            tooltip.tooltip('show');
            setTimeout(function(){
                tooltip.tooltip('hide');
            }, 2000);
        }
        else {
            $('#tasks-placeholder-' + project_id).remove();
            $('#project-' + project_id).find('table').find('tbody').append(data);
            $(this).find('input[name="task[name]"]').val('');
        }
    });

    //deleting task
    $(document).on("ajax:success", 'a.task-delete-link', function (event, data, status, xhr) {
        var id = $(this).attr("data-actiontarget");
        var project_id = $(this).attr("data-actiontargetparent");
        $('#project-' + project_id).find("#task-"+id).remove();
        var tbody = $('#project-' + project_id).find('table').find('tbody');
        if ($.trim(tbody.html()) == '') {
            tbody.append('<p id="tasks-placeholder-' + project_id + '" class="text-center tasks-placeholder"><br>No tasks left.</p>');
        }
    });

    // marking a task
    $(document).on("change", '.task-complete-checkbox', function() {
        var target = $(this).attr("value");
        var status = $(this).is(":checked") ? 1 :0 ;
        $.ajax({url: "/tasks/" + target,
            type: 'PATCH',
            data: {
                task: {
                    status: status
                }
            },
            error: function (data, status) {
                $(this).toggle();
            }
        });
    });

    // task modal
    $('#datetimepicker').datetimepicker({ showClear: true, allowInputToggle: true }); //activastin datetimepicker
    $('#editTaskModal').on('show.bs.modal', function (event) {
        var button = $(event.relatedTarget); // Button that triggered the modal
        var target = button.data('actiontarget'); // Extract info from data-* attributes
        var modal = $(this);
        var dtpicker = $('#datetimepicker').data("DateTimePicker");
        if ($('#deadline-task-' + target).length) {
            var new_date = moment($('#deadline-task-' + target).attr("data-deadline"), "YYYY-MM-DD HH-mm-ss Z");
            console.log(new_date);
            dtpicker.date(new_date);
        } else {
            dtpicker.date(null)
        }

        if (target != undefined) {
            var name = $("#task-name-" + target).text();
            $('#task-name-input').val(name);
            modal.find('.modal-title').text('Update task "' + name + '"');
            $('#editTaskModalButton').text("Update");
        } else {
            $('#editTaskModal').modal('hide');
        }

        $('#error_explanation').remove();

        // adding/editing project from modal
        $('#editTaskModalButton').off('click').click(function(){

            if ($('#task-name-input').val() == "" || $('#task-name-input').val().length > 250) {
                $('#error_explanation').remove();
                modal.find('.form-control-label').before('<div id="error_explanation"><div class="alert alert-danger">Enter correct name(non-empty, less then 128 characters.)</div></div>');
                return
            }

            var deadline = dtpicker.date();
            console.log(deadline);
            if (deadline != null){
                deadline = deadline.format("YYYY-MM-DD HH:mm:ss");
            }
            console.log(deadline);

            $.ajax({url: "/tasks/" + target,
                type: 'PATCH',
                data: {
                    task: {
                        name: $('#task-name-input').val(),
                        deadline: deadline
                    }
                },
                success: function (data, status) {
                    if (/error_explanation/.test(data)) {
                        $('#error_explanation').remove();
                        modal.find('.form-control-label').before(data);
                    } else {
                        $("#task-name-" + target).text($('#task-name-input').val());

                        if ($('#deadline-task-' + target).length) {
                            $('#deadline-task-' + target).remove()
                        }
                        $("#task-name-" + target).after(data);

                        $('#editTaskModal').modal('hide');  //format("MMM Do YYYY, HH:mm")
                    }
                }
            })
        });
    });


    $('#priorityModal').on('show.bs.modal', function (event) {
        var button = $(event.relatedTarget); // Button that triggered the modal
        var target = button.data('actiontarget'); // Extract info from data-* attributes
        var modal = $(this);
        //set
        if (target != undefined) {
            var name = $("#task-name-" + target).text();
            var priority = $("#task-priority-" + target).text();
            $('#priority-input').val(priority);
            modal.find('.modal-title').text('Set Priority "' + name + '"');
            $('#priorityModalButton').text("Update");
        } else {
            $('#priorityModal').modal('hide');
        }
        $('#error_explanation').remove();
        // editing priority from modal
        $('#priorityModalButton').off('click').click(function(){
            if ($('#priority-input').val() < 0 || $('#priority-input').val() > 1000) {
                modal.find('.form-control-label').before('<div id="error_explanation"><div class="alert alert-danger">Enter correct priority(non-empty, from 0 to 1000)</div></div>');
                return
            }
            $.ajax({url: "/tasks/" + target,
                type: 'PATCH',
                data: {
                    setPriority: true,
                    task: {
                        priority: $('#priority-input').val()
                    }
                },
                success: function (data, status) {
                    if (/error_explanation/.test(data)) {
                        modal.find('.form-control-label').before(data);
                    } else {
                        var tbody = $("#task-" + target).parent();
                        console.log(tbody);
                        tbody.children().detach();
                        tbody.append(data);
                        $('#priorityModal').modal('hide');
                    }
                }
            })

        });
    });

    
});

