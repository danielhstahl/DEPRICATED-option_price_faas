provider "google" {
  credentials = "${file("~/Documents/passwords/finside-fb812630c207.json")}"
  project     = "finside"
  region      = "us-east1"
}

/*provider "google-beta" {
  credentials = "${file("~/Documents/passwords/finside-fb812630c207.json")}"
  project     = "finside"
  region      = "us-central1"
}*/

resource "google_cloud_run_service" "option_price_faas" {
  name     = "option-pricer"
  location = "us-east1"
  //provider = "${"google"}"
  template {
    spec {
      containers {
        image = "gcr.io/finside/option_price_faas:1.0.0"
      }
    }
  }
  metadata {
    namespace = "finside"
  }

  //host  = "https://finside.org"
  //token = data.google_client_config.default.access_token
}
data "google_iam_policy" "noauth" {
  binding {
    role = "roles/run.invoker"
    members = [
      "allUsers",
    ]
  }
}

resource "google_cloud_run_service_iam_policy" "noauth" {
  location    = "us-east1" //google_cloud_run_service.option_price_faas.location
  project     = "finside"
  service     = "option-pricer"
  policy_data = data.google_iam_policy.noauth.policy_data
}
