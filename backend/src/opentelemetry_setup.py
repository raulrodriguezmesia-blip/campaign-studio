import os

from opentelemetry import metrics, trace
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
from opentelemetry.instrumentation.requests import RequestsInstrumentor
from opentelemetry.sdk.metrics import MeterProvider
from opentelemetry.sdk.resources import Resource
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor


class OpenTelemetrySetup:
    def __init__(self):
        self.service_name = "campaign-studio"
        self.sampling_rate = float(os.getenv("OTEL_SAMPLING_RATE", "1.0"))
        self.otlp_endpoint = os.getenv("OTEL_EXPORTER_OTLP_ENDPOINT", "otel-collector.istio-system.svc.cluster.local:4317")
        
    def initialize(self):
        resource = Resource.create({
            "service.name": self.service_name,
            "service.version": "0.1.0",
            "environment": os.getenv("ENVIRONMENT", "production"),
        })
        
        # Tracing
        tracer_provider = TracerProvider(resource=resource)
        otlp_exporter = OTLPSpanExporter(
            endpoint=self.otlp_endpoint,
            insecure=True
        )
        tracer_provider.add_span_processor(
            BatchSpanProcessor(otlp_exporter)
        )
        trace.set_tracer_provider(tracer_provider)
        
        # Metrics
        meter_provider = MeterProvider(resource=resource)
        metrics.set_meter_provider(meter_provider)
        
        RequestsInstrumentor().instrument()
        return trace.get_tracer(__name__), metrics.get_meter(__name__)

# Initialize on import
otel_setup = OpenTelemetrySetup()
tracer, meter = otel_setup.initialize()

# Metrics
campaigns_generated = meter.create_counter(
    "campaigns_generated_total",
    description="Total campaigns generated"
)

images_generated = meter.create_counter(
    "images_generated_total",
    description="Total images generated"
)

openai_api_errors = meter.create_counter(
    "openai_api_errors_total",
    description="OpenAI API errors"
)