import { createForm } from "@tanstack/solid-form"
import ky from "ky"
import { serialize } from "object-to-formdata"

const CreatePostForm = () => {
  let fileInput: HTMLInputElement

  const form = createForm(() => ({
    defaultValues: {
      content: "",
      media: undefined as undefined | File,
      username: "",
      password: "",
    },
    onSubmit: async ({ value, formApi }) => {
      formApi.reset()
      const data = serialize(value)
      const res: any = await ky.post("", { body: data }).json()
      window.location.href = res.redirect
      window.location.reload()
    },
  }))

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          form.handleSubmit()
        }}
        method="post"
        enctype="multipart/form-data"
      >
        <div>
          <form.Field
            name="content"
            children={(field) => (
              <>
                <label for={field().name}>Content</label>
                <input
                  name={field().name}
                  id={field().name}
                  value={field().state.value}
                  onInput={(e) => field().handleChange(e.target.value)}
                />
                {field().state.meta.errors ? (
                  <em role="alert">{field().state.meta.errors.join(", ")}</em>
                ) : null}
              </>
            )}
          />
        </div>
        <div>
          <form.Field
            name="media"
            validators={{
              onChangeListenTo: ["content"],
              onSubmit: ({ value, fieldApi }) => {
                const content = fieldApi.form.getFieldValue("content")
                if (!content && !value)
                  return "Either set content or add media."
                return undefined
              },
            }}
            children={(field) => (
              <>
                <label for={field().name}>Media</label>
                <input
                  name={field().name}
                  type="file"
                  ref={fileInput}
                  id={field().name}
                  accept="image/png, image/jpeg"
                  onChange={(e) =>
                    field().handleChange(e.target.files?.item(0) ?? undefined)
                  }
                />
                {field().state.meta.errors ? (
                  <em role="alert">{field().state.meta.errors.join(", ")}</em>
                ) : null}
                <div>
                  <button
                    type="button"
                    onClick={() => {
                      fileInput.value = ""
                      field().handleChange(undefined)
                    }}
                  >
                    Clear
                  </button>
                </div>
              </>
            )}
          />
        </div>
        <div>
          <form.Field
            name="username"
            validators={{
              onChangeListenTo: ["password"],
              onSubmit: ({ value, fieldApi }) => {
                const password = fieldApi.form.getFieldValue("password")
                if (password && !value)
                  return "If setting a password, set a username."
                return undefined
              },
            }}
            children={(field) => (
              <>
                <label for={field().name}>Username</label>
                <input
                  name={field().name}
                  id={field().name}
                  value={field().state.value}
                  onInput={(e) => field().handleChange(e.target.value)}
                />
                {field().state.meta.errors ? (
                  <em role="alert">{field().state.meta.errors.join(", ")}</em>
                ) : null}
              </>
            )}
          />
        </div>
        <div>
          <form.Field
            name="password"
            validators={{
              onChangeListenTo: ["username"],
              onSubmit: ({ value, fieldApi }) => {
                const username = fieldApi.form.getFieldValue("username")
                if (username && !value)
                  return "If setting a username, set a password."
                return undefined
              },
            }}
            children={(field) => (
              <>
                <label for={field().name}>Password</label>
                <input
                  name={field().name}
                  id={field().name}
                  type="password"
                  value={field().state.value}
                  onInput={(e) => field().handleChange(e.target.value)}
                />
                {field().state.meta.errors ? (
                  <em role="alert">{field().state.meta.errors.join(", ")}</em>
                ) : null}
              </>
            )}
          />
        </div>
        <div class="">
          <button type="submit">Submit</button>
        </div>
      </form>
    </div>
  )
}

export default CreatePostForm
