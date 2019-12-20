provider "google" {
  credentials = "${file("CREDENTIALS_FILE.json")}"
  project     = "finside"
  region      = "us-central1"
}

data "google_client_config" "default" {
}
resource "google_cloud_run_service" "option_price_faas" {
  name     = "option-pricer"
  location = "us-central1"

  template {
    spec {
      containers {
        image = "docker.io/phillyfan1138/option_price_faas"
      }
    }
  }
  metadata {
    annotations = {
      "autoscaling.knative.dev/maxScale" = "1000"
      "run.googleapis.com/client-name"   = "cloud-console"
    }
  }

  traffic {
    percent         = 100
    latest_revision = true
  }
  //host  = "https://finside.org"
  token = data.google_client_config.default.access_token
  cluster_ca_certificate = base64decode(
    data.google_container_cluster.my_cluster.master_auth[0].cluster_ca_certificate,
  )
}
resource "google_cloud_run_service_iam_member" "allUsers" {
  service  = google_cloud_run_service.option_price_faas.name
  location = google_cloud_run_service.option_price_faas.location
  role     = "roles/run.invoker"
  member   = "allUsers"
}
