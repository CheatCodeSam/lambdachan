import { createForm } from "@tanstack/solid-form"
import ky from "ky"
import { serialize } from "object-to-formdata"

const CreatePostForm = () => {
  let fileInput: HTMLInputElement

  const form = createForm(() => ({
    defaultValues: {
      content: "",
      media: undefined as undefined | File,
    },
    onSubmit: async ({ value, formApi }) => {
      formApi.reset()
      const data = serialize(value)
      const res: any = await ky.post("", { body: data }).json()
      window.location.href = res.redirect
      window.location.reload()
    },
    onSubmitInvalid: async ({ value, formApi }) => {},
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
            validators={{
              onSubmitAsync: async ({ value }) => {
                return value.length < 6 ? "error" : undefined
              },
            }}
            children={(field) => (
              <>
                <label for={field().name}>Content</label>
                <input
                  name={field().name}
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
            children={(field) => (
              <>
                <label for={field().name}>Media</label>
                <input
                  name={field().name}
                  type="file"
                  ref={fileInput}
                  accept="image/png, image/jpeg"
                  onInput={(e) =>
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
        <div class="">
          <button type="submit">Submit</button>
        </div>
      </form>
    </div>
  )
}

export default CreatePostForm
