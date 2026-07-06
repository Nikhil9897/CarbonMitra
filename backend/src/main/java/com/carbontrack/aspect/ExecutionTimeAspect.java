package com.carbontrack.aspect;

import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;

@Aspect
@Component
@Slf4j
public class ExecutionTimeAspect {

    @Around("execution(* com.carbontrack.controller..*(..)) || execution(* com.carbontrack.service..*(..))")
    public Object logExecutionTime(ProceedingJoinPoint joinPoint) throws Throwable {
        long start = System.currentTimeMillis();
        try {
            return joinPoint.proceed();
        } finally {
            long executionTime = System.currentTimeMillis() - start;
            if (executionTime > 50) { // Only log slow operations (> 50ms) to avoid log spamming
                log.info("Slow Execution: {} took {} ms", joinPoint.getSignature().toShortString(), executionTime);
            }
        }
    }
}
