provider "google" {
  credentials = "${file("~/Documents/passwords/finside-fb812630c207.json")}"
  project     = "finside"
  region      = "us-central1"
}

/*provider "google-beta" {
  credentials = "${file("~/Documents/passwords/finside-fb812630c207.json")}"
  project     = "finside"
  region      = "us-central1"
}*/

resource "google_cloud_run_service" "option_price_faas" {
  name     = "option-pricer"
  location = "us-central1"
  //provider = "${"google"}"
  template {
    spec {
      containers {
        image = "docker.io/phillyfan1138/option_price_faas:v1.0.0"
      }
    }
  }
  metadata {
    namespace = "finside"
  }

  //host  = "https://finside.org"
  //token = data.google_client_config.default.access_token
}

