interface StepIndicatorProps {
  currentStep: number
}

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  const steps = [
    { number: 1, label: "Servicios" },
    { number: 2, label: "Fecha\ny hora" },
    { number: 3, label: "Confirmación" },
  ]

  return (
    <div className="flex items-center justify-center gap-10 px-4" style={{ padding: "66px 0" }}>
      {steps.map((step, index) => (
        <div key={step.number} className="flex items-center gap-10">
          {/* Step indicator box and label */}
          <div className="flex flex-col items-center gap-3">
            {/* Gradient box for active/completed steps */}
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl font-bold text-white flex-shrink-0"
              style={
                currentStep >= step.number
                  ? {
                      background: "linear-gradient(180deg, #7B9A2D -72.56%, #1A2722 100%)",
                      border: "1px solid #9AC138",
                    }
                  : {
                      background: "#DFE1D5",
                      border: "none",
                    }
              }
            >
              {step.number}
            </div>
            <span className="text-base text-black text-center whitespace-pre-line font-medium">
              {step.label}
            </span>
          </div>

          {/* Connecting line */}
          {index < steps.length - 1 && (
            <div
              className="h-0 flex-shrink-0"
              style={{
                width: "152px",
                borderTop:
                  currentStep > step.number ? "3px solid #9AC138" : "2px dashed #D0D0D0",
              }}
            />
          )}
        </div>
      ))}
    </div>
  )
}
