provider "google" {
  credentials = "${file("CREDENTIALS_FILE.json")}"
  project     = "finside"
  region      = "us-central1"
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
  depends_on = [google_project_service.run, google_storage_bucket_iam_binding.container_registry_viewer]
}
resource "google_cloud_run_service_iam_member" "allUsers" {
  service  = google_cloud_run_service.option_price_faas.name
  location = google_cloud_run_service.option_price_faas.location
  role     = "roles/run.invoker"
  member   = "allUsers"
}
