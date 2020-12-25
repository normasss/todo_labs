$(() => {
  let tasks = [];
  let currentTab = 'all';
  let currentPage = 1;
  const LIMIT_PER_PAGE = 5;
  const KEY_CODE = 13;

  const shieldInput = (input) => (
    input.replace(/\u0026/gu, '&amp;')
      .replace(/\u003C/gu, '&lt;')
      .replace(/\u003E/gu, '&gt;')
      .replace(/\u0022/gu, '&quot;')
      .replace(/\u0027/gu, '&#x27;')
      .replace(/\u002F/gu, '&#x2F;')
  );

  const checkMainCheckbox = () => {
    const checkBoxIndicator = tasks.every((todo) => todo.checkBox) && tasks.length;
    $('#check-all').prop('checked', checkBoxIndicator);
  };

  const render = (elementsOnPage = tasks) => {
    checkMainCheckbox();
    let str = '';
    elementsOnPage.forEach((element) => {
      str += `<li id='${element.idOfTask}' class = 'tasks'> 
      <div class ='text-of-task'>${element.textOfTask}</div>
      <div style='display: flex; flex-direction: row; height: fit-content; align-items: center; padding-left: 10px;'>
        <input type = 'checkbox' class = 'check-boxes'  ${(element.checkBox === true) ? 'checked' : ''}>
        <input type='button' value='Delete'  class='delete-buttons' style='margin-left: 9px;'>
      </div>
      </li> `;
    });
    $('#main-list').html(str);
  };

  const filterOnTabs = (stateOfTab) => tasks.filter((element) => element.checkBox === stateOfTab);

  const tabsFunction = () => {
    let filteredArray = [];
    if (currentTab === 'all-tab') {
      filteredArray = tasks;
    } else {
      const stateOfTab = (currentTab !== 'checked-tab') ? false : true;
      filteredArray = filterOnTabs(stateOfTab);
    }
    return filteredArray;
  };

  const addActivePage = () => {
    $(`#pages-render :input[value=${currentPage}]`).addClass('active');
  };

  const pagination = (action, selectedCount) => {
    const test = tabsFunction();
    const countOfPages = Math.ceil(test.length / LIMIT_PER_PAGE);

    if (selectedCount) {
      currentPage = selectedCount;
    } else if (action === 'add') {
      currentPage = countOfPages;
    } else if (currentPage > countOfPages) {
      currentPage = countOfPages;
    }

    const startIndex = (currentPage - 1) * LIMIT_PER_PAGE;
    const endIndex = startIndex + LIMIT_PER_PAGE;
    const elementsOnPage = test.slice(startIndex, endIndex);
    let page = '';
    for (let i = 1; i <= countOfPages; i += 1) {
      page += `<input type = 'button' class = 'pages' value='${i}' >`;
    }
    $('#pages-render').html(page);
    addActivePage();
    render(elementsOnPage);
  };

  const saveChanges = (idOfSaveButton, editTask) => {
    tasks.forEach((element) => {
      if (Number(idOfSaveButton) === Number(element.idOfTask)) {
        const newElement = element;
        newElement.textOfTask = editTask;
      }
    });
    pagination();
  };

  const editFunction = (idOfSaveButton, editTask) => {
    if (editTask !== '') {
      saveChanges(idOfSaveButton, editTask);
    }
  };

  const countTasks = () => {
    const checkedTasks = filterOnTabs(true);
    $('#counter').html(
      `all tasks: ${tasks.length}
      checked tasks: ${checkedTasks.length}
      unchecked tasks: ${tasks.length - checkedTasks.length}
      `,
    );
  };

  const addActivePropertyOnTabs = () => {
    $('.tabs div').removeClass('active');
    $(`#${currentTab}`).addClass('active');
  };

  const activeTab = (state) => {
    currentTab = state;
    addActivePropertyOnTabs();
    pagination('add');
  };

  const addingObjectToArray = () => {
    const taskText = shieldInput($('#task-text').val().trim());
    if (taskText !== '') {
      const newTask = {
        textOfTask: taskText,
        idOfTask: Date.now(),
        checkBox: false,
      };
      tasks.push(newTask);
      currentTab = 'all';
      countTasks();
      pagination('add');
      tabsFunction();
      $('#task-text').val('');
      $('.tabs div').removeClass('active');
      $('#unchecked-tab').addClass('active');
    }
  };

  $('#task-text').on('keypress', (event) => {
    if (event.which === KEY_CODE) {
      addingObjectToArray();
    }
  });

  $('#add-button').on('click', addingObjectToArray);

  $('#check-all').on('change', () => {
    const tasksLength = tasks.length;
    const checkedArr = tasks.filter((element) => element.checkBox === true);
    if (tasksLength !== checkedArr.length) {
      tasks.forEach((element) => element.checkBox = true);
      $('#check-all').prop('checked', true);
    } else {
      tasks.forEach((element) => element.checkBox = false);
    }
    countTasks();
    pagination('add');
  });

  $(document).on('change', '.check-boxes', function () {
    const checkForAllCheckedCheckboxes = tasks.every((element) => element.checkBox);
    if (checkForAllCheckedCheckboxes) {
      $('#check-all').prop('checked', true);
    } else {
      $('#check-all').prop('checked', false);
    }

    const idOfCheckBox = $(this).parent().parent().attr('id');
    tasks.forEach((element) => {
      if (Number(idOfCheckBox) === Number(element.idOfTask)) {
        const newElement = element;
        newElement.checkBox = !element.checkBox;
      }
    });
    pagination();
    countTasks();
  });

  $(document).on('click', '.delete-buttons', function () {
    const idOfDeleteButton = Number($(this).parent().parent().attr('id'));
    tasks.forEach((element, index) => {
      if (idOfDeleteButton === element.idOfTask) {
        tasks.splice(index, 1);
      }
    });
    countTasks();
    pagination('delete');
  });

  $('#delete-all').on('click', () => {
    tasks.length = 0;
    countTasks();
    pagination();
  });

  $('#delete-checked').on('click', () => {
    tasks = filterOnTabs(false);
    countTasks();
    pagination();
  });

  $('.tabs div').on('click', (event) => {
    activeTab(event.currentTarget.id);
  });

  $(document).on('dblclick', '.text-of-task', function () {
    const text = $(this).text();
    $(this).replaceWith(`<input type='text' class='edit-input' value='${text}'><input type='button' value='Save' class='save-buttons'>`);
    $('.edit-input').focus();
  });

  $(document).on('blur', '.edit-input', function () {
    const idOfSaveButton = $(this).parent().attr('id');
    const editTask = shieldInput($(this).val().trim());
    editFunction(idOfSaveButton, editTask);
  });

  $(document).on('keypress', '.edit-input', function (event) {
    if (event.which === KEY_CODE) {
      const idOfSaveButton = $(this).parent().attr('id');
      const editTask = shieldInput($(this).val().trim());
      editFunction(idOfSaveButton, editTask);
    }
  });

  $(document).on('click', '.save-buttons', function () {
    const idOfSaveButton = $(this).parent().attr('id');
    const editTask = shieldInput($('.edit-input').val().trim());
    if (editTask !== '') {
      saveChanges(idOfSaveButton, editTask);
    }
  });

  $(document).on('click', '.pages', function () {
    currentPage = Number($(this).val());
    pagination('select', currentPage);
  });
});
