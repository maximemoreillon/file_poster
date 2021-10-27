<template>
  <div>
    <h1>File POSTer</h1>

    <form @submit.prevent="post_file()">
      <div class="">
        <label>URL</label>
        <input type="text" v-model="url">
      </div>
      <div class="">
        <label>File</label>
        <input type="file" ref="file_input">
      </div>
      <div class="">
        <label>Field name</label>
        <input type="text" v-model="field_name">
      </div>
      <div class="">
        <button type="submit">POST</button>
      </div>

    </form>

  </div>
</template>

<script>
// import HelloWorld from './components/HelloWorld.vue'

export default {
  name: 'App',
  components: {

  },
  data(){
    return {
      url: 'http://192.168.1.2:7070',
      field_name: 'image',
      posting: false,
    }
  },
  methods: {
    post_file(){
      this.posting = true
      
      const headers = {'Content-Type': 'multipart/form-data' }
      const formData = new FormData()
      formData.append(this.field_name, this.$refs.file_input.files[0])

      this.axios.post(this.url, formData, { headers })
        .then( () => {
          alert('POST successful')
        })
        .catch( (error) => {

          if(error.response) console.error(error.response.data)
          else console.error(error)

          alert(`POST failed`)
        })
        .finally( () => {
          this.posting = false
        })


    }
  }

}
</script>

<style>
body {
  text-align: center;
  font-family: sans-serif;
}
form > div {
  margin: 1em 0;
}

form label {
  margin-right: 1em;
}
</style>
