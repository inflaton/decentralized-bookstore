<template>
  <div>
    <div class="card" style="width: 18rem">
      <img class="card-img-top" src="../assets/Book.png" alt="Card image cap" />
      <div class="card-body">
        <h5 class="card-title">{{ bookObject.name }}</h5>
        <p class="card-title">Price: {{ bookObject.price }}</p>
        <!-- <p class="card-text">Available: {{ bookObject.available }}</p> -->
        <button class="btn btn-primary btn-lg btn-block" v-on:click="toggle">
          View
        </button>
      </div>
    </div>
    <details-modal
      v-if="showModal"
      :bookData="bookObject"
      :userData="userObject"
      @userInteractionCompleted="onUserInteractionCompleted"
    >
    </details-modal>
  </div>
</template>

<script>
import DetailsModal from "./DetailsModal.vue";
import mixin from "../libs/mixinViews";

export default {
  mixins: [mixin],
  props: ["bookObject", "userObject"],
  data() {
    return {
      showModal: false,
    };
  },
  components: {
    DetailsModal,
  },
  methods: {
    toggle() {
      this.showModal = !this.showModal;
    },
    onUserInteractionCompleted(e) {
      console.log(`onUserInteractionCompleted: ${JSON.stringify(e)}`);
      this.toggle();
    },
  },
};
</script>
