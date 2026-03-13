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
    <div className="flex flex-wrap md:flex-nowrap items-center justify-center gap-4 md:gap-10 px-4 py-8 md:py-[66px]">
      {steps.map((step, index) => (
        <div key={step.number} className="flex items-center gap-4 md:gap-10">
          {/* Step indicator box and label */}
          <div className="flex flex-col items-center gap-2 md:gap-3">
            {/* Gradient box for active/completed steps */}
            <div
              className="w-10 h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center text-xl md:text-2xl font-bold text-white flex-shrink-0"
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
            <span className="text-[12px] md:text-base text-black text-center whitespace-pre-line font-medium leading-tight">
              {step.label}
            </span>
          </div>

          {/* Connecting line - Hidden on small mobile */}
          {index < steps.length - 1 && (
            <div
              className="hidden sm:block h-0 flex-shrink-0"
              style={{
                width: "40px",
                maxWidth: "152px",
                flexGrow: 1,
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
