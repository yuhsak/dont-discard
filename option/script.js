const state = {
  fields: [],
}

const uuid = () =>
  `${1e7}-${1e3}-${4e3}-${8e3}-${1e11}`.replace(/[018]/g, (a) =>
    (Number(a) ^ ((Math.random() * 16) >> (Number(a) / 4))).toString(16),
  )

const createField = (value, id) => {
  /* Container */
  const container = document.createElement('div')
  container.classList.add('field')
  container.setAttribute('data-field-id', id)

  /* Text input */
  const input = document.createElement('input')
  input.setAttribute('type', 'text')
  if (value) {
    input.value = value
  }
  input.setAttribute('placeholder', '^https?://.+\\..+')
  input.setAttribute('data-field-id', id)

  /* Delete button */
  const del = document.createElement('button')
  del.classList.add('delete')
  del.innerText = 'Delete'
  del.setAttribute('data-field-id', id)
  del.addEventListener('click', (e) => {
    const id = e.target.getAttribute('data-field-id')
    deleteField(id)
  })

  container.append(input, del)
  return { container, input }
}

const addField = (fields, value) => {
  const id = uuid()
  const field = createField(value, id)
  fields.appendChild(field.container)
  state.fields.push({
    id,
    field,
  })
}

const deleteField = (id) => {
  const field = document.querySelector(`div[data-field-id="${id}"]`)
  field.remove()
  state.fields = state.fields.filter((item) => item.id !== id)
}

const serialize = (state) => {
  return {
    fields: state.fields
      .map(({ id, field: { input } }) => {
        return {
          id,
          value: input.value,
        }
      })
      .filter((item) => !!item.value),
  }
}

const showToast = (message, type) => () => {
  const toast = document.querySelector('#toast')
  toast.innerHTML = message
  toast.classList.add('show')
  if (type) {
    toast.classList.add(type)
  }
  setTimeout(() => {
    toast.classList.remove('show')
  }, 1000)
}

const saved = showToast('Saved !', 'success')

document.addEventListener('DOMContentLoaded', (e) => {
  const fields = document.querySelector('#fields')

  const addBtn = document.querySelector('button#add')
  addBtn.addEventListener('click', (e) => {
    addField(fields)
  })

  const saveBtn = document.querySelector('button#save')
  saveBtn.addEventListener('click', () => {
    const serializedState = serialize(state)
    chrome.storage.sync.set(serializedState, saved)
  })

  chrome.storage.sync.get({ fields: [] }, (state) => {
    state.fields.forEach((field) => {
      addField(fields, field.value)
    })
    if (!state.fields.length) {
      addField(fields, '^https?://.*')
    }
  })
})
