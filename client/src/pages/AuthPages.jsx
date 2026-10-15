import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useLocation, Navigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { auth } from '../api';
import { useAuth } from '../store/authStore';
import { Button, Input } from '../components/ui';
import { Logo } from '../components/layout/AppShell';
import { errMsg } from '../utils/cn';

const loginSchema = z.object({ email: z.string().email('Enter a valid email address.'), password: z.string().min(1, 'Enter your password.') });
const registerSchema = z.object({
  name: z.string().min(2, 'Enter your name.'),
  email: z.string().email('Enter a valid email address.'),
  password: z.string().min(8, 'Use at least 8 characters.'),
});
const forgotPasswordSchema = z.object({ email: z.string().email('Enter a valid email address.') });
const resetPasswordSchema = z.object({
  password: z.string().min(8, 'Use at least 8 characters.'),
  confirmPassword: z.string().min(8, 'Use at least 8 characters.'),
}).refine((value) => value.password === value.confirmPassword, {
  message: 'Passwords do not match.',
  path: ['confirmPassword'],
});

function Shell({ title, sub, children, footer }) {
  return (
    <div className="grid min-h-screen place-items-center px-4 py-10">
      <div className="w-full max-w-[440px]">
        <Logo className="mb-8 justify-center" />
        <div className="rounded-2xl border border-line bg-surface p-6 shadow-[0_18px_40px_rgba(23,52,46,0.1)] sm:p-7">
          <h1 className="text-3xl font-bold">{title}</h1>
          <p className="mb-5 mt-2 text-sm text-dim">{sub}</p>
          {children}
        </div>
        <p className="mt-4 text-center text-sm text-dim">{footer}</p>
      </div>
    </div>
  );
}

export function Login() {
  const { user, login } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(loginSchema) });
  if (user) return <Navigate to="/dashboard" replace />;
  const submit = async (v) => {
    try { await login(v); toast.success('Signed in'); nav(loc.state?.from || '/dashboard', { replace: true }); }
    catch (e) { toast.error(errMsg(e)); }
  };
  return (
    <Shell title="Sign in" sub="Pick up where you left off." footer={<>New here? <Link className="text-accent underline" to="/register">Create an account</Link></>}>
      <form onSubmit={handleSubmit(submit)} className="space-y-4" noValidate>
        <Input label="Email" type="email" autoComplete="email" error={errors.email?.message} {...register('email')} />
        <Input label="Password" type="password" autoComplete="current-password" error={errors.password?.message} {...register('password')} />
        <div className="text-right text-sm"><Link className="text-accent underline" to="/forgot-password">Forgot password?</Link></div>
        <Button type="submit" loading={isSubmitting} className="w-full">Sign in</Button>
      </form>
    </Shell>
  );
}

export function Register() {
  const { user, register: signUp } = useAuth();
  const nav = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(registerSchema) });
  if (user) return <Navigate to="/dashboard" replace />;
  const submit = async (v) => {
    try { await signUp(v); toast.success('Account created'); nav('/dashboard', { replace: true }); }
    catch (e) { toast.error(errMsg(e)); }
  };
  return (
    <Shell title="Create your account" sub="Free to start. Your data stays private to you." footer={<>Already registered? <Link className="text-accent underline" to="/login">Sign in</Link></>}>
      <form onSubmit={handleSubmit(submit)} className="space-y-4" noValidate>
        <Input label="Name" autoComplete="name" error={errors.name?.message} {...register('name')} />
        <Input label="Email" type="email" autoComplete="email" error={errors.email?.message} {...register('email')} />
        <Input label="Password" type="password" autoComplete="new-password" hint="At least 8 characters." error={errors.password?.message} {...register('password')} />
        <Button type="submit" loading={isSubmitting} className="w-full">Create account</Button>
      </form>
    </Shell>
  );
}

export function ForgotPassword() {
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm({ resolver: zodResolver(forgotPasswordSchema) });

  const submit = async (value) => {
    try {
      await auth.forgotPassword(value);
      toast.success('If an account exists, a reset link has been sent.');
      reset();
    } catch (e) {
      toast.error(errMsg(e));
    }
  };

  return (
    <Shell title="Forgot your password?" sub="We’ll send a reset link to your email." footer={<>Remembered it? <Link className="text-accent underline" to="/login">Back to sign in</Link></>}>
      <form onSubmit={handleSubmit(submit)} className="space-y-4" noValidate>
        <Input label="Email" type="email" autoComplete="email" error={errors.email?.message} {...register('email')} />
        <Button type="submit" loading={isSubmitting} className="w-full">Send reset link</Button>
      </form>
    </Shell>
  );
}

export function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const nav = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(resetPasswordSchema) });

  const submit = async (value) => {
    if (!token) {
      toast.error('Reset token is missing or expired.');
      return;
    }

    try {
      await auth.resetPassword({ token, password: value.password });
      toast.success('Password reset successful.');
      nav('/login', { replace: true });
    } catch (e) {
      toast.error(errMsg(e));
    }
  };

  return (
    <Shell title="Reset your password" sub={token ? 'Choose a new password for your account.' : 'This reset link is missing a token.'} footer={<>Need a new link? <Link className="text-accent underline" to="/forgot-password">Request another</Link></>}>
      <form onSubmit={handleSubmit(submit)} className="space-y-4" noValidate>
        <Input label="New password" type="password" autoComplete="new-password" hint="At least 8 characters." error={errors.password?.message} {...register('password')} />
        <Input label="Confirm password" type="password" autoComplete="new-password" error={errors.confirmPassword?.message} {...register('confirmPassword')} />
        <Button type="submit" loading={isSubmitting} className="w-full" disabled={!token}>Update password</Button>
      </form>
    </Shell>
  );
}
