from django.apps import AppConfig

class FoldersConfig(AppConfig):
    name = "folders"

    def ready(self):
        import folders.signals
