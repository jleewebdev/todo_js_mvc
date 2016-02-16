var App = {
  $el: $("main"),
  $todos: $("#todos"),
  editTodo: function(e) {
    var idx = +$(e.target).attr("data-id"),
        model = App.Todos.get(idx),
        $edit_form = $(templates.todo_edit(model.attributes));

    model.view.$el.after($edit_form);
    model.view.$el.remove();

    $edit_form.on("blur", "input", App.hideEdit.bind(App));
  },
  newTodo: function(e) {
    e.preventDefault();
    var name = $(e.target).find("#todo_name").val(),
        model,
        view;

    if (!name) { return; }

    model = this.Todos.add({
      name: name,
      complete: false
    });
    view = new this.TodoView(model);
    view.$el.appendTo(this.$todos);

    e.target.reset();
  },
  hideEdit: function(e) {
    var $input = $(e.currentTarget),
        $li = $input.closest("li"),
        name = $input.val(),
        idx = +$li.attr("data-id"),
        model = App.Todos.get(idx);

    model.set("name", name);
    $li.after(model.view.$el);
    $li.remove();
    $input.off(e);
  },
  toggleComplete: function(e) {
    var $li = $(e.target).closest("li"),
        idx = +$li.attr("data-id"),
        model = App.Todos.get(idx);

    model.set("complete", !model.get("complete"));
    $li.toggleClass("complete", model.get("complete"));
    return false;
  },
  clearCompleted: function(e) {
    e.preventDefault();
    var completed = App.Todos.models.filter(function(model) {
      return model.attributes.complete;
    });

    completed.forEach(function(model) {
      App.Todos.remove(model);
    });
  },
  bind: function() {
    this.$el.find("form").on("submit", this.newTodo.bind(this));
    this.$el.find("#clear").on("click", this.clearCompleted.bind(this));
  },
  init: function() {
    this.bind();
  }
};

var templates = {};

$("[type='text/x-handlebars']").each(function() {
  var $t = $(this);

  templates[$t.attr("id")] = Handlebars.compile($t.html());
});

// Todo model constructor; used in our todos collection
App.TodoConstructor = new ModelConstructor();

// Todos collection constructor
App.TodosConstructor = new CollectionConstructor();

// The todo collection creation
App.Todos = new App.TodosConstructor(App.TodoConstructor);

// The todo view constructor; used to create a new view for each model
App.TodoView = new ViewConstructor({
  tag_name: "li",
  template: templates.todo,
  events: {
    "click": App.editTodo,
    "click a.toggle": App.toggleComplete
  }
});

App.init();
