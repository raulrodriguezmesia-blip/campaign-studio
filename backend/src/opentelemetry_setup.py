"""OpenTelemetry setup (optional).

If the opentelemetry packages are installed AND an OTLP collector is
reachable, real traces/metrics are exported. Otherwise we fall back to
no-op stubs so the app runs anywhere (local, Render free tier, etc.)
without crashing on import or at startup.
"""

import os


class _NoOpSpan:
    def set_attribute(self, *args, **kwargs):
        return None

    def record_exception(self, *args, **kwargs):
        return None

    def __enter__(self):
        return self

    def __exit__(self, *args):
        return False


class _NoOpTracer:
    def start_as_current_span(self, *args, **kwargs):
        return _NoOpSpan()


class _NoOpMeter:
    def create_counter(self, *args, **kwargs):
        class _C:
            def add(self, *a, **k):
                return None

        return _C()


class _NoOpSetup:
    def __init__(self):
        self.service_name = "campaign-studio"
        self.tracer = _NoOpTracer()
        self.meter = _NoOpMeter()


def _build_real():
    from opentelemetry import metrics, trace
    from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
    from opentelemetry.instrumentation.requests import RequestsInstrumentor
    from opentelemetry.sdk.metrics import MeterProvider
    from opentelemetry.sdk.resources import Resource
    from opentelemetry.sdk.trace import TracerProvider
    from opentelemetry.sdk.trace.export import BatchSpanProcessor

    class RealSetup:
        def __init__(self):
            self.service_name = "campaign-studio"
            endpoint = os.getenv(
                "OTEL_EXPORTER_OTLP_ENDPOINT",
                "otel-collector.istio-system.svc.cluster.local:4317",
            )
            resource = Resource.create(
                {
                    "service.name": self.service_name,
                    "service.version": "0.1.0",
                    "environment": os.getenv("ENVIRONMENT", "production"),
                }
            )
            tracer_provider = TracerProvider(resource=resource)
            tracer_provider.add_span_processor(
                BatchSpanProcessor(OTLPSpanExporter(endpoint=endpoint, insecure=True))
            )
            trace.set_tracer_provider(tracer_provider)
            meter_provider = MeterProvider(resource=resource)
            metrics.set_meter_provider(meter_provider)
            try:
                RequestsInstrumentor().instrument()
            except Exception:
                pass
            self.tracer = trace.get_tracer(__name__)
            self.meter = metrics.get_meter(__name__)

    return RealSetup()


# Try real OTel; fall back to no-op stubs on any failure.
try:
    otel_setup = _build_real()
except Exception:
    otel_setup = _NoOpSetup()

tracer = otel_setup.tracer
meter = otel_setup.meter

# Metrics (work with both real meter and no-op stub)
campaigns_generated = meter.create_counter(
    "campaigns_generated_total",
    description="Total campaigns generated",
)
images_generated = meter.create_counter(
    "images_generated_total",
    description="Total images generated",
)
openai_api_errors = meter.create_counter(
    "openai_api_errors_total",
    description="OpenAI API errors",
)
