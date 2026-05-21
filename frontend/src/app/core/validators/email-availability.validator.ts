import { inject } from '@angular/core';
import {
  AbstractControl,
  AsyncValidatorFn,
  ValidationErrors,
} from '@angular/forms';
import { AuthService } from '@core/services/auth.service';
import { catchError, debounceTime, map, of, switchMap, take } from 'rxjs';


export function emailAvailabilityValidator(): AsyncValidatorFn {
  const auth = inject(AuthService);

  return (control: AbstractControl) => {
    const raw = typeof control.value === 'string' ? control.value.trim() : '';
    if (!raw || control.hasError('email') || control.hasError('required')) {
      return of(null);
    }

    return of(raw).pipe(
      debounceTime(450),
      switchMap((email) =>
        auth.checkEmailAvailable(email).pipe(
          map((res) =>
            res.available ? null : ({ emailTaken: true } satisfies ValidationErrors),
          ),
          catchError(() => of(null)),
        ),
      ),
      take(1),
    );
  };
}
