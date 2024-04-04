<template>
  <div>
    <v-row>
      <v-col cols="auto">
        <v-btn small v-if="editable" @click="add_field()">
          <v-icon left>mdi-plus</v-icon>
          <span>Add field</span>
        </v-btn>
      </v-col>
    </v-row>
    <div v-if="fields.length">
      <v-row
        v-for="(item, index) in fields"
        :key="`field_item_${index}`"
        align="center"
      >
        <v-col>
          <v-text-field
            v-model="item.name"
            placeholder="Key"
            :disabled="!editable"
            :rules="key_rules"
            required
          />
        </v-col>
        <v-col cols="auto">:</v-col>
        <v-col>
          <v-text-field
            v-model="item.value"
            placeholder="Value"
            :disabled="item.readOnly"
            :rules="value_rules"
            required
          />
        </v-col>
        <v-col cols="auto">
          <v-btn icon v-if="editable" @click="delete_field(index)">
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </v-col>
      </v-row>
    </div>

    <div v-else>
      <v-row>
        <v-col cols="auto"> No fields </v-col>
      </v-row>
    </div>
  </div>
</template>

<script>
export default {
  name: "RequestHeadersManagement",
  props: {
    value: Array,
    editable: Boolean,
  },
  data() {
    return {
      key_rules: [(v) => !!v || "Key is required"],
      value_rules: [(v) => !!v || "Value is required"],
    };
  },
  methods: {
    add_field() {
      this.fields.push({ name: "", value: "" });
    },
    delete_field(i) {
      this.fields.splice(i, 1);
    },
  },
  computed: {
    fields: {
      get() {
        return this.value;
      },
      set(newVal) {
        console.log(newVal);
        this.$emit("input", newVal);
      },
    },
  },
};
</script>

<style scoped>
table {
  width: 100%;
}
</style>
